const Validator = require('Validator');

const { default: localizify } = require('localizify');
var en = require('../language/en');
var ar = require('../language/ar');
// const { t } = require('localizify');


var con = require('../config/database');

var cryptoLib = require('cryptlib')
var shaKey = cryptoLib.getHashSha256(process.env.KEY, 32)

var bypassMethods = new Array("login", "signup");


var middleware = {

    // to check that given data is provided or not
    checkValidationRules: function (req, res, request, rules, message, keywords) {
        const v = Validator.make(request, rules, message, keywords);
        console.log(v.fails())
        if (v.fails()) {
            console.log("request", request)
            console.log("rules", rules)
            console.log("message", message)
            // console.log("keywords", keywords)
            console.log(v.getErrors())
            const errors = v.getErrors();
            console.log("Error2:", errors);

            var error_data = "";
            for (var key in errors) {
                error_data = errors[key][0];
                break;
            }
            response_data = {
                code: "0",
                message: error_data,
            }
            res.status(200);
            res.send(response_data);

            return false;
        } else {
            return true;
        }

    },

    extractHeaderLanguage: function (req, res, callback) {
        var headerlang = (req.headers['accept-language'] != undefined && req.headers['accept-language'] != "") ? req.headers['accept-language'] : 'en';
        console.log(headerlang)
        // req.lang = headerlang;

        req.language = (headerlang == 'en') ? en : ar;

        localizify
            .add('en', en)
            .add('ar', ar)
            .setLocale(req.language);

        callback();
    },

    decryption: function (encrypted_text) {
        if (encrypted_text != undefined && Object.keys(encrypted_text).length !== 0) {
            try {
                var request = JSON.parse(cryptoLib.decrypt(encrypted_text, shaKey, process.env.IV));
                console.log("request", request);
                return request;
            } catch (error) {
                return;
            }
        } else {
            return;
        }
    },

    encryption: function (response_data) {
        try {
            var response = cryptoLib.encrypt(JSON.stringify(response_data), shaKey, process.env.IV);
            return response;
        } catch (error) {
            return;
        }
    },

    validateApiKey: function (req, res, callback) {
        var api_key = (req.headers['api-key'] != undefined && req.headers['api-key'] != "") ? req.headers['api-key'] : '';
        console.log("All headers:", req.headers);
        console.log("11:" + req.headers['api-key'])
        if (api_key != "") {

            try {
                var dec_apikey = cryptoLib.decrypt(api_key, shaKey, process.env.IV);
                if (dec_apikey != "" && dec_apikey == process.env.API_KEY) {
                    callback();
                } else {
                    response_data = {
                        code: '0',
                        message: req.language.header_key_value_incorrect
                    }
                    res.status(401);
                    res.send(middleware.encryption(response_data));
                }
            } catch (error) {
                response_data = {
                    code: '0',
                    message: req.language.header_key_value_incorrect
                }
                res.status(401);
                res.send(middleware.encryption(response_data));
            }

        } else {

            response_data = {
                code: '0',
                message: req.language.header_key_value_incorrect
            }
            res.status(401);
            res.send(middleware.encryption(response_data));
        }
    },

    validateHeaderToken: function (req, res, callback) {

        var headertoken = (req.headers['token'] != undefined && req.headers['token'] != "") ? req.headers['token'] : '';

        var path_data = req.path.split("/");
        console.log(path_data);
        console.log("2:" + headertoken)
        if (bypassMethods.indexOf(path_data[3]) === -1) {
            if (headertoken != "") {
                // var dec_token = cryptoLib.decrypt(headertoken, shaKey, process.env.IV);
                // console.log(dec_token);
                try {
                    if (path_data[2] === 'admin') {
                        con.query("SELECT * FROM tbl_admin WHERE admin_token = ? ", [dec_token], function (error, result) {
                            if (!error && result.length > 0) {
                                req.admin = result[0];
                                console.log("Admin:", req.admin);
                                callback();
                            } else {
                                response_data = {
                                    code: '0',
                                    message: req.language.header_authorization_token_error
                                }
                                var response = middleware.encryption(response_data);
                                console.log("response", response);
                                res.status(401);
                                res.send(response);
                            }
                        });
                    } else {
                        con.query("SELECT * FROM tbl_user WHERE token = ? ", [headertoken], function (error, result) {
                            //adding user's all details in req object 
                            if (!error && result.length > 0) {
                                req.user = result[0];
                                console.log("User:", req.user);
                                callback();
                            } else {
                                response_data = {
                                    code: '0',
                                    message: req.language.header_authorization_token_error
                                }
                                var response = middleware.encryption(response_data);
                                console.log("response", response);
                                res.status(401);
                                res.send(response);
                            }
                        });

                    }
                } catch (error) {
                    response_data = {
                        code: '0',
                        message: req.language.header_authorization_token_error
                    }
                    res.status(401);
                    res.send(middleware.encryption(response_data));
                }

            } else {

                response_data = {
                    code: '0',
                    message: req.language.header_authorization_token_error
                }
                res.status(401);
                res.send(middleware.encryption(response_data));
            }
        } else {
            callback();
        }
    },
};


module.exports = middleware;