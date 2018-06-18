'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var translateReply = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2(text, userFirstName) {
        var translatedTextInEnglish;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return translate(text, { to: 'en' });

                    case 2:
                        translatedTextInEnglish = _context2.sent.text;
                        return _context2.abrupt('return', userFirstName + ' said "' + translatedTextInEnglish + '"');

                    case 4:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function translateReply(_x2, _x3) {
        return _ref2.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var axios = require('axios');
var franc = require('franc');
var translate = require('google-translate-api');
var RtmClient = require('@slack/client').RtmClient;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var user_token = process.env.USER_TOKEN || 'xoxp-2443115515-110808892454-244564439859-a268c7435aa8220713b2d4254a23b9d0';
var bot_token = process.env.BOT_API_KEY || 'xoxb-120335742129-sNCz8MXNhYgNctwAROkQJrfe';

var rtm = new RtmClient(bot_token);

rtm.on(RTM_EVENTS.MESSAGE, function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
        var channel, thread_ts, user, text, request_url, userFirstName, isAbleToReplyBackInEnglish, translatedReply;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        channel = data.channel, thread_ts = data.thread_ts, user = data.user, text = data.text;
                        request_url = 'https://slack.com/api/users.info?token=' + user_token + '&user=' + user;
                        _context.next = 4;
                        return axios.get(request_url);

                    case 4:
                        userFirstName = _context.sent.data.user.profile.first_name;

                        if (!((channel[0] === 'C' || channel[0] === 'U' || channel[0] === 'G') && !data.hasOwnProperty('subtype'))) {
                            _context.next = 12;
                            break;
                        }

                        if (!isAbleToReply(text)) {
                            _context.next = 12;
                            break;
                        }

                        isAbleToReplyBackInEnglish = text.length > 20;
                        _context.next = 10;
                        return translateReply(text, userFirstName);

                    case 10:
                        translatedReply = _context.sent;

                        if (isAbleToReplyBackInEnglish) {
                            sendMessage(thread_ts, translatedReply, channel);
                        }

                    case 12:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}());

rtm.start();

function isAbleToReply(text) {
    var isFinnish = franc(text) === 'fin';
    var simpleFinnishTerms = ['kiitos', 'kiitii', 'moi', 'hyvää', 'onnea', 'hei'];
    var notSimpleFinnish = true;
    simpleFinnishTerms.forEach(function (term) {
        if (text.toLowerCase().includes(term)) {
            return notSimpleFinnish = false;
        }
    });
    return isFinnish && (notSimpleFinnish || text.length > 20) && notOnlyHttpLink(text);
}

function notOnlyHttpLink(text) {
    return !(text.includes('http') && text.split(' ').length === 1);
}

function sendMessage(thread_ts, text, channel) {
    if (thread_ts) {
        rtm.send({
            text: text,
            channel: channel,
            thread_ts: thread_ts,
            type: RTM_EVENTS.MESSAGE
        });
    } else {
        rtm.sendMessage(text, channel);
    }
};
