"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
exports.useModal = function (config) {
    var modalConfig = config || {};
    var _a = modalConfig.defaultVisible, defaultVisible = _a === void 0 ? false : _a;
    var _b = react_1.useState(defaultVisible), visible = _b[0], setVisible = _b[1];
    var show = react_1.useCallback(function () { return setVisible(true); }, [visible]);
    var close = react_1.useCallback(function () { return setVisible(false); }, [visible]);
    var modalProps = {
        visible: visible,
        onCancel: close,
    };
    return {
        visible: visible,
        show: show,
        close: close,
        modalProps: modalProps,
    };
};
