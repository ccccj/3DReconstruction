package com.cj.reconstruction.response;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;

@ApiModel(value = "api接口通用业务常用返回类型",parent = FeheadResponse.class)
public class CommonReturnType extends FeheadResponse {
    // 返回请求处理结果
    @ApiModelProperty(value = "请求状态",dataType = "String")
    private String status;


    public static CommonReturnType create(Object result) {
        return CommonReturnType.create(result, "success");
    }

    public static CommonReturnType create(Object result, String status) {
        CommonReturnType type = new CommonReturnType();
        type.setData(result);
        type.setStatus(status);

        return type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Object getData() {
        return data;
    }

    public void setData(Object data) {
        this.data = data;
    }
}
