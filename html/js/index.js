$(function(){

    var url = 'http://127.0.0.1';
    var mark = 0;
    var userToken = $.session.get('token');
    if(userToken == undefined || userToken == "") {
        $('#in').css('display', 'block');
        $('#out').css('display', 'none');
    } else {
        $('#in').css('display', 'none');
        $('#out').css('display', 'block');
    }

    $('.navbar-brand').click(function() {
        window.location.reload();
    })
    /**
     * 初始化勾选框
     */
    var $thr = $('table thead tr');
    var $checkAllTh = $('<th><input class="checkbox" style="display:none" type="checkbox" id="checkAll" name="checkAll" /></th>');
    /*将全选/反选复选框添加到表头最前，即增加一列*/
    $thr.prepend($checkAllTh);
    function initTableCheckbox() {
        
        /*“全选/反选”复选框*/
        var $checkAll = $thr.find('input');
        
        $checkAll.click(function(event){
            /*将所有行的选中状态设成全选框的选中状态*/
            $tbr.find('input').prop('checked',$(this).prop('checked'));
            /*并调整所有选中行的CSS样式*/
            if ($(this).prop('checked')) {
            $tbr.find('input').parent().parent().addClass('warning');
            } else{
            $tbr.find('input').parent().parent().removeClass('warning');
            }
            /*阻止向上冒泡，以防再次触发点击操作*/
            event.stopPropagation();
        });
        /*点击全选框所在单元格时也触发全选框的点击操作*/
        $checkAllTh.click(function(){
            $(this).find('input').click();
        });
        var $tbr = $('table tbody tr');
        var $checkItemTd = $('<td><input class="checkbox" style="display:none" type="checkbox" name="checkItem" /></td>');
        /*每一行都在最前面插入一个选中复选框的单元格*/
        $tbr.prepend($checkItemTd);
        /*点击每一行的选中复选框时*/
        $tbr.find('input').click(function(event){
            /*调整选中行的CSS样式*/
            $(this).parent().parent().toggleClass('warning');
            /*如果已经被选中行的行数等于表格的数据行数，将全选框设为选中状态，否则设为未选中状态*/
            $checkAll.prop('checked',$tbr.find('input:checked').length == $tbr.length ? true : false);
            /*阻止向上冒泡，以防再次触发点击操作*/
            event.stopPropagation();
        });
    }
    
    /**
     * 清空勾选框
     */
    function clearTableCheckbox() {
        var $thr = $('table thead tr');
        var $checkAll = $thr.find('input');
        /*将全选框的设为未选中状态*/
        $checkAll.prop('checked', false);
        var $tbr = $('table tbody tr');
        /*清除CSS样式*/
        $tbr.find('input').parent().parent().removeClass('warning');
        /*将选中框设置为未选中*/
        $tbr.find('input').prop('checked', false);
        /*阻止向上冒泡，以防再次触发点击操作*/
        event.stopPropagation();
    }

    /**
     * 首页加载
     */
    function initTable() {
        $.ajax({
            //请求方式
            type: "GET",
            //请求的媒体类型
            contentType: "application/json;charset=UTF-8",
            //请求地址
            url : url + "/patent/getPatents",
            headers: {
                "authorization":userToken
            },
            //请求成功
            success : function(result) {
                console.log(result);
                // console.log(result.data.length);
                if(result.status == 'success') {
                    for(let i = result.data.length -1; i >= 0 ; i--) {
                        $('table tbody').prepend('<tr><td>' + result.data[i].id + '</td>' +
                                                    '<td>' + result.data[i].code + '</td>' + 
                                                    '<td>' + result.data[i].name + '</td>' +
                                                    '<td>' + result.data[i].inventor + '</td>' +
                                                    '<td>' + result.data[i].applicant + '</td>' +
                                                    '<td>' + result.data[i].publicationTime + '</td></tr>');
                    }
                } else if (result.data.errorCode == 10002){
                    alert(result.data.errorMsg, null, function () {
                        $('#login').modal();
                    }, {type: 'error', confirmButtonText: 'OK'});
                } else {
                    alert(result.data.errorMsg, null, function () {
                    }, {type: 'error', confirmButtonText: 'OK'});
                }
                initTableCheckbox();
                //点击每一行时也触发该行的选中操作
                $('table tbody tr').click(function(){
                    if($.trim($(".delete").css('display')) == $.trim('block')) {
                        $(this).find('input').click();
                    } else if($.trim($(".update").css('display')) == $.trim('block')) {
                        mark = $(this).find('td').eq(1).text();
                        // console.log(mark);
                        $('table tbody tr').each(function() {
                            // console.log($(this).find('td').eq(1).text() == mark);
                            if($(this).find('td').eq(1).text() == mark) {
                                $(this).addClass('warning');
                            } else {
                                $(this).removeClass('warning');
                            }
                        })
                    }
                });
            },
            //请求失败，包含具体的错误信息
            error : function(e){
                console.log(e.status);
                console.log(e.responseText);
            }
        })
    }
    initTable();
    


    /**
     * 点击删除按钮禁用除 取消 删除 外其他按钮，显示勾选框
     * */
    $("#btn_delete").click(function(){
        console.log("--------------delete--------------");
        $(".checkbox").css('display', 'block');
        $(".delete").css('display', 'block');
        $(".btn").attr('disabled', true);
        $("#btn_default").attr('disabled', false);
        $("#btn_danger").attr('disabled', false);
    });
    /**
     * 点击修改按钮弹出修改框
     */
    $("#btn_update").click(function(){
        console.log("--------------update--------------");
        $(".radio").css('display', 'block');
        $(".update").css('display', 'block');
        $(".btn").attr('disabled', true);
        $("#btn_default").attr('disabled', false);
        $("#btn_primary").attr('disabled', false);
        $(".mod").attr('disabled', false);
    });
    /**
     * 点击修改按钮弹出修改框
     */
    function update() {
        console.log("--------------to update--------------");
        if(mark == 0) {
            alert("请选择有效数据", null, function () {
            }, {type: 'warning', confirmButtonText: 'OK'});
        } else {
            let code = $("table tbody tr[class='warning']").find('td').eq(2).text();
            let name = $("table tbody tr[class='warning']").find('td').eq(3).text();
            let inventor = $("table tbody tr[class='warning']").find('td').eq(4).text();
            let applicant = $("table tbody tr[class='warning']").find('td').eq(5).text();
            let publication_time = $("table tbody tr[class='warning']").find('td').eq(6).text();
            

            $('#infoLabel').text("修改");
            $('#btn_submit').text("修改");
            $('#info').modal();

            $('#code').val(code);
            $('#name').val(name);
            $('#inventor').val(inventor);
            $('#applicant').val(applicant);
            $('#publication_time').val(publication_time);
        
        }
    }
    $("#btn_primary").click(function(){
        update();
    });
    /**
     * 点击添加按钮弹出新增框
     * */
    function add() {
        console.log("--------------add--------------");
        $('#infoLabel').text("新增")
        $('#btn_submit').text("增加")
        $('#info').modal();
        $('#code').val("");
        $('#name').val("");
        $('#inventor').val("");
        $('#applicant').val("");
        $('#publication_time').val("");
    }
    $("#btn_add").click(function() {
        add()
    });
    /**
     * 点击取消按钮解除按钮禁用，隐藏 取消 删除 按钮，清空勾选框
     * */
    $("#btn_default").click(function() {
        console.log("--------------delete cancel--------------");
        $(".checkbox").css('display', 'none');
        $(".radio").css('display', 'none');
        $(".delete").css('display', 'none');
        $(".update").css('display', 'none');
        $(".btn").attr('disabled', false);
        clearTableCheckbox();
    });
    /**
     * 点击删除按钮弹出确认框
     * */
    $("#btn_danger").click(function() {
        console.log("--------------make sure if delete--------------");
        //取表格的选中行数据
        var arrselections = [];
        var ids = [];
        $('table tbody tr input[name="checkItem"]').each(function(i){
            // console.log($(this).get(0).checked == true);
            if($(this).get(0).checked == true) {
                // console.log(i);
                arrselections.push($(this).val());
                // console.log("id:" + $('table tbody').find('tr').eq(i).find('td').eq(1).text());
                ids.push($('table tbody').find('tr').eq(i).find('td').eq(1).text());
            }
        });
        console.log(ids);
        if (arrselections.length <= 0) {
            alert("请选择有效数据", null, function () {
            }, {type: 'warning', confirmButtonText: 'OK'});
        } else {
            confirm("删除确认", "你将无法复原该操作", function (isConfirm) {

                if (isConfirm) {
                    //after click the confirm
                    console.log(ids);
                    $.ajax({
                        type: "POST",
                        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
                        url: url + "/patent/deletePatents",
                        headers: {
                            "authorization":userToken
                        },
                        data: {
                            "ids": JSON.stringify(ids)
                        },
                        dataType: "json",
                        success: function (result) {
                            console.log(result);
                            if (result.status == "success") {
                                alert("删除成功", null, function () {
                                    window.location.reload()
                                }, {type: 'success', confirmButtonText: 'OK'});
                                
                            } else if (result.data.errorCode == 10002){
                                alert(result.data.errorMsg, null, function () {
                                    $('#login').modal();
                                }, {type: 'error', confirmButtonText: 'OK'});
                            } else {
                                alert(result.data.errorMsg, null, function () {
                                }, {type: 'error', confirmButtonText: 'OK'});
                            }
                        },
                        error: function () {
                            alert("error", null, function () {
                            }, {type: 'error', confirmButtonText: 'OK'});
                        },
                        complete: function () {
        
                        }
        
                    });
                } else {
                    //after click the cancel
                }
            }, {confirmButtonText: '确认', cancelButtonText: '取消', width: 400});
                
        }

        
    });
    
    $("#btn_submit").click(function() {
        console.log("--------------do it--------------")
        var id = 0;
        var uri = "";
        var ret = "";
        var err = -1;
        if($('#infoLabel').text() == "新增") {
            uri = "/patent/addPatent";
            ret = "新增成功";
            err = 0;
        } else if($('#infoLabel').text() == "修改") {
            uri = "/patent/updatePatent";
            ret = "修改成功";
            id = mark;
            err = 1;
        } else {
            alert("操作异常", null, function () {
            }, {type: 'error', confirmButtonText: 'OK'});
        }
        var code = $.trim($('#code').val());
        // console.log(code);
        var name = $.trim($('#name').val());
        var inventor = $.trim($('#inventor').val());
        var applicant = $.trim($('#applicant').val());
        var publication_time = $.trim($('#publication_time').val());
        if(code==null||code==undefined||code==""||
        name==null||name==undefined||name==""||
        inventor==null||inventor==undefined||inventor==""||
        applicant==null||applicant==undefined||applicant==""||
        publication_time==null||publication_time==undefined||publication_time==""){
            alert("内容不能为空", null, function () {
                if(err == 0) {
                    add();
                } else if(err == 1) {
                    update();
                }
            }, {type: 'error', confirmButtonText: 'OK'});
            return;
        }

        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            url: url + uri,
            headers: {
                "authorization":userToken
            },
            data: {
                "id": id,
                "code": code,
                "name": name,
                "inventor": inventor,
                "applicant": applicant,
                "publication_time": publication_time
            },
            dataType: "json",
            success: function (result) {
                console.log(result);
                if (result.status == "success") {
                    alert(ret, null, function () {
                        window.location.reload();
                    }, {type: 'success', confirmButtonText: 'OK'});
                    
                } else if (result.data.errorCode == 10002){
                    alert(result.data.errorMsg, null, function () {
                        $('#login').modal();
                    }, {type: 'error', confirmButtonText: 'OK'});
                } else {
                    alert(result.data.errorMsg, null, function () {
                        if(err == 0) {
                            add();
                        } else if(err == 1) {
                            update();
                        }
                    }, {type: 'error', confirmButtonText: 'OK'});
                }
            },
            error: function () {
                alert("error", null, function () {
                }, {type: 'error', confirmButtonText: 'OK'});
            },
            complete: function () {

            }

        });
    })
    

    $("#btn_search_code").click(function() {
        console.log("--------------search code--------------");
        var code = $("#code_text").val();
        $.ajax({
            //请求方式
            type: "get",
            //请求的媒体类型
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            //请求地址
            url : url + "/patent/getPatentsByCode",
            headers: {
                "authorization":userToken
            },
            data:{
                "code": code
            },
            dataType: "json",
            //请求成功
            success: function(result) {
                console.log(result);
                // console.log(result.data.length);
                if(result.status == 'success') {
                    $('table tbody ').html("<tr></tr>");
                    for(let i = result.data.length -1; i >= 0 ; i--) {
                        $('table tbody ').html('<tr><td>' + result.data[i].id + '</td>' +
                                                    '<td>' + result.data[i].code + '</td>' + 
                                                    '<td>' + result.data[i].name + '</td>' +
                                                    '<td>' + result.data[i].inventor + '</td>' +
                                                    '<td>' + result.data[i].applicant + '</td>' +
                                                    '<td>' + result.data[i].publicationTime + '</td></tr>');
                    }
                    initTableCheckbox();
                }  else if (result.data.errorCode == 10002){
                    alert(result.data.errorMsg, null, function () {
                        $('#login').modal();
                    }, {type: 'error', confirmButtonText: 'OK'});
                } else {
                    alert(result.data.errorMsg, null, function () {
                    }, {type: 'error', confirmButtonText: 'OK'});
                }
                //点击每一行时也触发该行的选中操作
                $('table tbody tr').click(function(){
                    if($.trim($(".delete").css('display')) == $.trim('block')) {
                        $(this).find('input').click();
                    } else if($.trim($(".update").css('display')) == $.trim('block')) {
                        mark = $(this).find('td').eq(1).text();
                        // console.log(mark);
                        $('table tbody tr').each(function() {
                            // console.log($(this).find('td').eq(1).text() == mark);
                            if($(this).find('td').eq(1).text() == mark) {
                                $(this).addClass('warning');
                            } else {
                                $(this).removeClass('warning');
                            }
                        })
                    }
                });
            },
            //请求失败，包含具体的错误信息
            error : function(e){
                console.log(e.status);
                console.log(e.responseText);
            }
        })
    })
    $("#btn_search_name").click(function() {
        console.log("--------------search code--------------");
        var name = $("#name_text").val();
        $.ajax({
            //请求方式
            type: "get",
            //请求的媒体类型
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            //请求地址
            url : url + "/patent/getPatentsByName",
            headers: {
                "authorization":userToken
            },
            data:{
                "name": name
            },
            dataType: "json",
            //请求成功
            success : function(result) {
                console.log(result);
                // console.log(result.data.length);
                if(result.status == 'success') {
                    $('table tbody ').html("<tr></tr>");
                    for(let i = result.data.length -1; i >= 0 ; i--) {
                        $('table tbody ').prepend('<tr><td>' + result.data[i].id + '</td>' +
                                                    '<td>' + result.data[i].code + '</td>' + 
                                                    '<td>' + result.data[i].name + '</td>' +
                                                    '<td>' + result.data[i].inventor + '</td>' +
                                                    '<td>' + result.data[i].applicant + '</td>' +
                                                    '<td>' + result.data[i].publicationTime + '</td></tr>');
                    }
                    initTableCheckbox();
                } else if (result.data.errorCode == 10002){
                    alert(result.data.errorMsg, null, function () {
                        $('#login').modal();
                    }, {type: 'error', confirmButtonText: 'OK'});
                } else {
                    alert(result.data.errorMsg, null, function () {
                    }, {type: 'error', confirmButtonText: 'OK'});
                }
                //点击每一行时也触发该行的选中操作
                $('table tbody tr').click(function(){
                    if($.trim($(".delete").css('display')) == $.trim('block')) {
                        $(this).find('input').click();
                    } else if($.trim($(".update").css('display')) == $.trim('block')) {
                        mark = $(this).find('td').eq(1).text();
                        // console.log(mark);
                        $('table tbody tr').each(function() {
                            // console.log($(this).find('td').eq(1).text() == mark);
                            if($(this).find('td').eq(1).text() == mark) {
                                $(this).addClass('warning');
                            } else {
                                $(this).removeClass('warning');
                            }
                        })
                    }
                });
            },
            //请求失败，包含具体的错误信息
            error : function(e){
                console.log(e.status);
                console.log(e.responseText);
            }
        })
    })

    $('#btn_login').click(function() {
        let username = $('#username').val();
        let password = $('#password').val();
        console.log(password);
        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            url: url + "/login/login",
            data: {
                "username": username,
                "password": password
            },
            dataType: "json",
            success: function (result) {
                console.log(result);
                if (result.status == "success") {
                    $.session.set('token', result.data);
                    alert("登录成功", null, function () {
                        window.location.reload()
                    }, {type: 'success', confirmButtonText: 'OK'});
                    
                } else if (result.data.errorCode == 10002){
                    alert(result.data.errorMsg, null, function () {
                        $('#login').modal();
                    }, {type: 'error', confirmButtonText: 'OK'});
                } else {
                    alert(result.data.errorMsg, null, function () {
                    }, {type: 'error', confirmButtonText: 'OK'});
                }
            },
            error: function () {
                alert("error", null, function () {
                }, {type: 'error', confirmButtonText: 'OK'});
            },
            complete: function () {

            }

        });
    })

    $('#in').click(function() {
        $('#login').modal();
    })

    $('#out').click(function() {
        $.session.remove('token');
        window.location.reload();
    })
    /**
     * 时间选择框格式设定
     */
    $(".time input").datepicker({
        formate: "yyyy-mm-dd",
        language: "zh-CN"
    })
    

});