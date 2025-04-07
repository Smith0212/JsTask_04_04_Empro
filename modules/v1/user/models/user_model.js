const pool = require('../../../../config/database');
const common = require('../../../../utilities/common');
const responseCode = require('../../../../utilities/response_code');
const response_message = require('../../../../language/en');
const constant = require('../../../../config/constant');
const md5 = require('md5');
const user = require('../controllers/user');
const e = require('express');
const geolib = require('geolib');
const util = require('util');
const query = util.promisify(pool.query.bind(pool));
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();



class UserModel {
    async signup(req, res) {
        try {
            console.log("Request body:", req.body);
            const request_data = req.body;
            const data = {
                name: request_data.name,
                email: request_data.email,
                password: bcrypt.hashSync(request_data.password, 10),
                is_active: 1,
                is_deleted: 0
            };

            // check if the user already exists
            const checkUserQuery = "SELECT * FROM tbl_user WHERE email = ? AND is_deleted = 0";
            const existingUser = await query(checkUserQuery, [request_data.email]);

            if (existingUser.length > 0) {
                const user = existingUser[0];
                if (user.login_type !== data.login_type) {
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: "Cannot sign up with a different login type for the same account",
                        data: null
                    });
                }
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "User already exists",
                    data: null
                });
            }

            // check if the user is deleted
            const checkDeletedUserQuery = "SELECT * FROM tbl_user WHERE email = ? AND is_deleted = 1";
            const deletedUser = await query(checkDeletedUserQuery, [request_data.email]);

            if (deletedUser.length > 0) {
                console.log("User was previously deleted, allowing signup.");
            }

            // Insert new user
            const insertUserQuery = "INSERT INTO tbl_user SET ?";
            const result = await query(insertUserQuery, data);

            const user_id = result.insertId;
            return common.response(res, {
                code: responseCode.SUCCESS,
                message: response_message.success,
                data: { user_id }
            });
        } catch (error) {
            console.error("Error in signup:", error);
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.unsuccess,
                data: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const request_data = req.body;

            const selectQuery = "SELECT * FROM tbl_user WHERE email = ?";
            const _userInfo = await query(selectQuery, [request_data.email]);

            if (_userInfo && _userInfo.length >= 1) {
                const user = _userInfo[0];
                console.log("User found:", user);
                const isPasswordValid = await bcrypt.compare(request_data.password, user.password);
                if (!isPasswordValid) {
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: response_message.login_invalid_credential,
                        data: null
                    });
                }

                if (user.is_active !== 1) {
                    return common.response(res, {
                        code: responseCode.INACTIVE_ACCOUNT,
                        message: response_message.account_is_deactivated,
                        data: user
                    });
                }

                const age = 1000 * 60 * 60 * 24 * 7;

                const token = jwt.sign(
                    {
                        id: user.id,
                    },
                    "asdfghjkl",
                    { expiresIn: age }
                );

                const updateTokenQuery = "UPDATE tbl_user SET token = ? WHERE id = ?";
                await query(updateTokenQuery, [token, user.id]);

                return res
                    .cookie("token", token, {
                        maxAge: age,
                    })
                    .status(200)
                    .json({
                        code: responseCode.SUCCESS,
                        message: req.language.success,
                        data: { user_id: user.id, token }
                    });

            } else {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: response_message.login_invalid_credential,
                    data: null
                });
            }
        } catch (error) {
            console.error("Error in login:", error);
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.unsuccess,
                data: error.message
            });
        }
    }


    async addTask(req, res) {
        try {
            const request_data = req.body;
            const user_id = req.user.id;
            console.log("taskData:")

            if (request_data.name === undefined || request_data.name === "") {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: req.language.task_name_required,
                    data: null
                });
            }

            // Check if the task name is unique for the user
            const checkTaskQuery = "SELECT * FROM tbl_task WHERE name = ? AND user_id = ?";
            const existingTask = await query(checkTaskQuery, [request_data.name, user_id]);

            if (existingTask.length > 0) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: req.language.task_name_already_exists || "Task name already exists",
                    data: null
                });
            }

            const data = {
                name: request_data.name,
                description: request_data.description,
                deadline: request_data.deadline,
                user_id: user_id
            };

            const insertTaskQuery = "INSERT INTO tbl_task SET ?";
            let responseData = await query(insertTaskQuery, data);

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: req.language.success,
                data: responseData.insertId
            });
        } catch (error) {
            console.error("Error in addTask:", error);
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.unsuccess,
                data: error.message
            });
        }
    }

    async getTasks(req, res) {
        try {
            const user_id = req.user.id;

            const selectQuery = "SELECT * FROM tbl_task WHERE user_id = ? AND is_deleted = 0";
            const tasks = await query(selectQuery, [user_id]);

            if (tasks.length > 0) {
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: req.language.success,
                    data: tasks
                });
            } else {
                return common.response(res, {
                    code: responseCode.NO_DATA_FOUND,
                    message: req.language.no_data_found,
                    data: null
                });
            }
        } catch (error) {
            console.error("Error in getTasks:", error);
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.unsuccess,
                data: error.message
            });

        }
    }

    async editTask(req, res) {
        try {
            const task_id = req.params.id;
            const request_data = req.body;
            const user_id = req.user.id;

            let userData = {};

            if (Object.keys(request_data).length == 0 || request_data == undefined || request_data == {}) {
                return common.response(res, {
                    code: responseCode.SUCCESS,
                    message: "nothing to edit",
                    data: user,
                });
            }
            else {
                if (request_data.name === undefined || request_data.name === "") {
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: req.language.task_name_required,
                        data: null
                    });
                }

                // Check if the task name is unique for the user
                const checkTaskQuery = "SELECT * FROM tbl_task WHERE name = ? AND user_id = ? AND id != ?";
                const existingTask = await query(checkTaskQuery, [request_data.name, user_id, task_id]);

                if (existingTask.length > 0) {
                    return common.response(res, {
                        code: responseCode.OPERATION_FAILED,
                        message: req.language.task_name_already_exists || "Task name already exists",
                        data: null
                    });
                }

                userData = request_data;
            }

            const updateTaskQuery = "UPDATE tbl_task SET ? WHERE id = ? AND user_id = ?";
            let data = await query(updateTaskQuery, [userData, task_id, user_id]);

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: req.language.success,
                data: data.affectedRows > 0 ? data.affectedRows : 0
            });

        } catch (error) {
            console.error("Error in editTask:", error);
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.unsuccess,
                data: error.message
            });
        }
    }

    async deleteTask(req, res) {
        try {
            const task_id = req.params.id;
            const user_id = req.user.id;

            const deleteTaskQuery = "UPDATE tbl_task SET is_deleted = 1 WHERE id = ? AND user_id = ?";
            let data = await query(deleteTaskQuery, [task_id, user_id]);

            return common.response(res, {
                code: responseCode.SUCCESS,
                message: req.language.success,
                data: data.affectedRows > 0 ? data.affectedRows : 0
            });
        } catch (error) {
            console.error("Error in deleteTask:", error);
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.unsuccess,
                data: error.message
            });
        }
    }
    async startTask(req, res) {
        try {
            const { task_id } = req.body;
            const user_id = req.user.id;
    
            if (!task_id) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Task ID is required",
                    data: null
                });
            }
    
            // fetch task
            const selectQuery = "SELECT * FROM tbl_task WHERE id = ? AND user_id = ?";
            const taskData = await query(selectQuery, [task_id, user_id]);
            if (taskData.length === 0) {
                return common.response(res, {
                    code: responseCode.NO_DATA_FOUND,
                    message: "Task not found",
                    data: null
                });
            }
    
            const task = taskData[0];
    
            // update start time only if not already running
            if (task.status !== 'in_progress') {
                await query("UPDATE tbl_task SET start = NOW(), status = 'in_progress' WHERE id = ?", [task_id]);
            }
    
            return common.response(res, {
                code: responseCode.SUCCESS,
                message: "Task started/resumed",
                data: null
            });
    
        } catch (error) {
            console.error("Error in startTask:", error);
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.unsuccess,
                data: error.message
            });
        }
    }
    

    async pauseTask(req, res) {
        try {
            const { task_id } = req.body;
            const user_id = req.user.id;
    
            if (!task_id) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Task ID is required",
                    data: null
                });
            }
    
            const selectQuery = "SELECT * FROM tbl_task WHERE id = ? AND user_id = ?";
            const taskData = await query(selectQuery, [task_id, user_id]);
    
            if (taskData.length === 0) {
                return common.response(res, {
                    code: responseCode.NO_DATA_FOUND,
                    message: "Task not found",
                    data: null
                });
            }
    
            const task = taskData[0];
    
            if (!task.start) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Task was never started",
                    data: null
                });
            }
    
            const [timeDiffResult] = await query("SELECT TIMESTAMPDIFF(SECOND, ?, NOW()) AS seconds_diff", [task.start]);
            console.log("timeDiffResult:", timeDiffResult)
            const secondsDiff = timeDiffResult.seconds_diff || 0;
            console.log(task.total_time)
            // calculate updated total seconds
            const prevSeconds = convertHHMMSSToSeconds(task.total_time || "00:00:00");
            const updatedSeconds = prevSeconds + secondsDiff;
    
            const updatedTotal = convertSecondsToHHMMSS(updatedSeconds);
            console.log("updatedTotal:", updatedTotal)
            const updateQuery = `
                UPDATE tbl_task 
                SET pause = NOW(), status = 'pending', total_time = ?, updated_at = NOW() 
                WHERE id = ? AND user_id = ?
            `;
    
            await query(updateQuery, [updatedTotal, task_id, user_id]);
    
            return common.response(res, {
                code: responseCode.SUCCESS,
                message: "Task paused and time updated",
                data: updatedTotal
            });
    
        } catch (error) {
            console.error("Error in pauseTask:", error);
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.unsuccess,
                data: error.message
            });
        }
    }
    

    async submitTask(req, res) {
        try {
            const { task_id } = req.body;
            const user_id = req.user.id;
    
            if (!task_id) {
                return common.response(res, {
                    code: responseCode.OPERATION_FAILED,
                    message: "Task ID is required",
                    data: null
                });
            }
    
            const selectQuery = "SELECT * FROM tbl_task WHERE id = ? AND user_id = ?";
            const taskData = await query(selectQuery, [task_id, user_id]);
    
            if (taskData.length === 0) {
                return common.response(res, {
                    code: responseCode.NO_DATA_FOUND,
                    message: "Task not found",
                    data: null
                });
            }
    
            const task = taskData[0];
            let totalSeconds = convertHHMMSSToSeconds(task.total_time || "00:00:00");
    
            if (task.status === 'in_progress' && task.start) {
                const [timeDiffResult] = await query("SELECT TIMESTAMPDIFF(SECOND, ?, NOW()) AS seconds_diff", [task.start]);
                totalSeconds += timeDiffResult.seconds_diff || 0;
            }
    
            const finalTotalTime = convertSecondsToHHMMSS(totalSeconds);
    
            const updateQuery = `
                UPDATE tbl_task 
                SET end = NOW(), total_time = ?, status = 'completed', updated_at = NOW()
                WHERE id = ? AND user_id = ?
            `;
            await query(updateQuery, [finalTotalTime, task_id, user_id]);
    
            return common.response(res, {
                code: responseCode.SUCCESS,
                message: "Task submitted successfully",
                data: finalTotalTime
            });
    
        } catch (error) {
            console.error("Error in submitTask:", error);
            return common.response(res, {
                code: responseCode.OPERATION_FAILED,
                message: response_message.unsuccess,
                data: error.message
            });
        }
    }
    

}

// Utility function to convert HH:MM:SS to seconds
function convertHHMMSSToSeconds(hhmmss) {
    const [hours, minutes, seconds] = hhmmss.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
}

// Utility function to convert seconds to HH:MM:SS
function convertSecondsToHHMMSS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours, minutes, secs].map(unit => String(unit).padStart(2, '0')).join(':');
}

module.exports = new UserModel();




