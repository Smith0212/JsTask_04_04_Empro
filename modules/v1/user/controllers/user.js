const user_model = require("../models/user_model"); // Import user model for database operations
const common = require("../../../../utilities/common"); // Import common utilities for response handling
const importRules = require("../../../../utilities/rules"); // Import validation rules
const middleware = require("../../../../middleware/validators"); // Import middleware for validation
const { json } = require("express");

class User {

  async signup(req, res) {
    try {

      const userData = req.body;

      let rules = importRules.signup_simple;
      let message = {
        required: req.language.required,
      };
      let keywords = {
        password: req.language.password,
        phone: req.language.phone,
        email: req.language.email
      };

      const isValid = middleware.checkValidationRules(req, res, userData, rules, message, keywords);
      if (isValid) {
        await user_model.signup(req, res);
      }
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
      const userData = req.body;
      console.log("body", req.body);
      console.log("userData", userData);

      let rules = importRules.login_simple;

      let message = {
        required: req.language.required,
      };

      let keywords = {
        'email': req.language.email_phone,
        'password': req.language.password,
      };

      const isValid = middleware.checkValidationRules(req, res, userData, rules, message, keywords);
      if (isValid) {
        await user_model.login(req, res);
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
  
  async logout(req, res) {
    try {
      const token = req.headers['token']; 
      console.log("token", token);
      if (!token) {
        return common.response(res, {
          code: responseCode.UNAUTHORIZED,
          message: req.language.token_missing,
          data: null
        });
      }

      await user_model.logout(token);
      return common.response(res, {
        code: responseCode.SUCCESS,
        message: req.language.logout_success,
        data: null
      });
    } catch (error) {
      console.error("Error in logout:", error);
      return common.response(res, {
        code: responseCode.OPERATION_FAILED,
        message: response_message.unsuccess,
        data: error.message
      });
    }
  }

  async addTask(req, res) {
    try {
      const taskData = req.body

      let rules = importRules.addTaskRules;
      let message = {
        required: req.language.required,
      };
      let keywords = {
        'name': req.language.task_name,
        'description': req.language.task_description
      };

      let isValid = middleware.checkValidationRules(req, res, taskData, rules, message, keywords);
      if (isValid) {
        await user_model.addTask(req, res);
      }

    } catch (error) {
      console.log("error in add task", error)
      return common.response(res, {
        code: responseCode.OPERATION_FAILED,
        message: response_message.unsuccess,
        data: error.message
      });
    }
  }

  async getTasks(req, res) {
    try {
      await user_model.getTasks(req, res);
    } catch (error) {
      console.log("error in get tasks", error);
      return common.response(res, {
        code: responseCode.OPERATION_FAILED,
        message: response_message.unsuccess,
        data: error.message
      });
    }
  }

  async editTask(req, res) {
    try {
      await user_model.editTask(req, res);

    } catch (error) {
      console.log("error in edit task", error)
      return common.response(res, {
        code: responseCode.OPERATION_FAILED,
        message: response_message.unsuccess,
        data: error.message
      });
    }
  }

  async deleteTask(req, res) {
    try {
      await user_model.deleteTask(req, res);
    } catch (error) {
      console.log("error in delete task", error)
      return common.response(res, {
        code: responseCode.OPERATION_FAILED,
        message: response_message.unsuccess,
        data: error.message
      });
    }
  }

  async startTask(req, res) {
    try {
      const taskData = req.body
      console.log("task data", taskData)
      let rules = { task_id: "required" };
      let message = {
        required: req.language.required,
      };
      let keywords = {
        'task_id': req.language.task_id,
      };

      let isValid = middleware.checkValidationRules(req, res, taskData, rules, message, keywords);
      if (isValid) {
        await user_model.startTask(req, res);
      }
    } catch (error) {
      console.log("error in start task", error)
      return common.response(res, {
        code: responseCode.OPERATION_FAILED,
        message: response_message.unsuccess,
        data: error.message
      });
    }
  }

  async pauseTask(req, res) {
    try {
      const taskData = req.body
      console.log("task data", taskData)
      let rules = { task_id: "required" };
      let message = {
        required: req.language.required,
      };
      let keywords = {
        'task_id': req.language.task_id,
      };

      let isValid = middleware.checkValidationRules(req, res, taskData, rules, message, keywords);
      if (isValid) {
        await user_model.pauseTask(req, res);
      }
    } catch (error) {
      console.log("error in pause task", error)
      return common.response(res, {
        code: responseCode.OPERATION_FAILED,
        message: response_message.unsuccess,
        data: error.message
      });
    }
  }

  async submitTask(req, res) {
    try {
      const taskData = req.body
      console.log("task data", taskData)
      let rules = { task_id: "required", total_seconds: "required" };
      let message = {
        required: req.language.required,
      };
      let keywords = {
        'task_id': req.language.task_id,
        'total_seconds': req.language.total_seconds,
      };

      let isValid = middleware.checkValidationRules(req, res, taskData, rules, message, keywords);
      if (isValid) {
        await user_model.submitTask(req, res);
      }
    } catch (error) {
      console.log("error in submit task", error)
      return common.response(res, {
        code: responseCode.OPERATION_FAILED,
        message: response_message.unsuccess,
        data: error.message
      });
    }

  }
}

module.exports = new User();