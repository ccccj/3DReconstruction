(function( $ ){
    $('#calib-btn').click(function() {
        var url = "http://localhost:9876/3DReconstruction"
        $.ajax({
            type: "GET",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            url: url + "/calibration",
            data: {
            },
            dataType: "json",
            success: function (result) {
                if (result.status == "success") {

                    var data = result.data;
                    alert("标定成功", "focal : " + data.focal + "<br>dist : " + data.dist[0] + "<br>" + data.dist[1] + "<br>" + data.dist[2] + "<br>" + data.dist[3] + "<br>" + data.dist[4] + "<br>K : <br>" + data.K[0] + "," + data.K[1] + "," + data.K[2] + ",<br>" + data.K[3] + "," + data.K[4] + "," + data.K[5] + ",<br>" + data.K[6] + "," + data.K[7] + "," + data.K[8], function () {
                    }, {type: 'success', confirmButtonText: 'OK'});
                } else {
                    alert(result.data.errorMsg, null, function () {
                    }, {type: 'error', confirmButtonText: 'OK'});
                }
            },
            error: function () {
                alert("error", null, function () {
                }, {type: 'error', confirmButtonText: 'OK'});
            }
        });
    })
})( jQuery );
