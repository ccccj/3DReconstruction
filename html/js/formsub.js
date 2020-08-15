(function( $ ){
    $('#fat-btn').click(function() {
        var url = "http://localhost:9876/3DReconstruction"
        var focal = $('#focal').val();
        var dist1 = $('#dist1').val();
        var dist2 = $('#dist2').val();
        var dist3 = $('#dist3').val();
        var dist4 = $('#dist4').val();
        var dist5 = $('#dist5').val();
        var k00 = $('#k00').val();
        var k02 = $('#k02').val();
        var k11 = $('#k11').val();
        var k12 = $('#k12').val();

        $.ajax({
            type: "POST",
            contentType: "application/x-www-form-urlencoded;charset=UTF-8",
            url: url + "/reconstruction",
            data: {
                "focal": focal,
                "dist1": dist1,
                "dist2": dist2,
                "dist3": dist3,
                "dist4": dist4,
                "dist5": dist5,
                "k00": k00,
                "k02": k02,
                "k11": k11,
                "k12": k12
            },
            dataType: "json",
            success: function (result) {
                console.log(result);
                if (result.status == "success") {
                    alert("重建成功", null, function () {
                        window.location="/Users/Amon/Desktop/_3D-reconstruction/Reconstruction/result";
                    }, {type: 'success', confirmButtonText: '前往下载'});

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
