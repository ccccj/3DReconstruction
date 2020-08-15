package com.cj.reconstruction.error;

public enum EmBusinessError implements CommonError {
    // 通用错误类型 10001
    UNKNOWN_ERROR(10000, "未知错误"),
    PARAMETER_VALIDATION_ERROR(10001, "参数不合法"),
    JSON_SEQUENCE_WRONG(10002,"不合法的json序列化字符串"),
    UPLOAD_ERROR(10003, "上传失败");



    private EmBusinessError(int errCode, String errMsg) {
        this.errCode = errCode;
        this.errMsg = errMsg;
    }

    private int errCode;
    private String errMsg;



    @Override
    public int getErrorCode() {
        return errCode;
    }

    @Override
    public String getErrorMsg() {
        return errMsg;
    }

    @Override
    public CommonError setErrMsg(String errMsg) {
        this.errMsg = errMsg;
        return this;
    }

    public static EmBusinessError valueOfByCode(int errCode){
        for (EmBusinessError value : EmBusinessError.values()) {
            if(value.getErrorCode()==errCode){
                return value;
            }
        }
        return null;
    }

}
