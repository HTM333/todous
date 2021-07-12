
// export default {
//     RemoteControl (group,operation,timeout) {
//         console.log(group)
//         console.log(operation)
//         console.log(timeout)
//         // webSocketApi.deviceOperation({
//         //     group:group,
//         //     opreration:operation,
//         //     timeout:timeout
//         // }).then(res => {
//         //     console.log(res)
//         //     alert(1234)
//         // }).catch(err => {
//         //
//         // })
//     }
// }
//var debugPage = parent.debugPage
function RemoteControlBySvg (group,operation,timeout,javaIp,token) {
        console.log(group)
        console.log(operation)
        console.log(timeout)

    var Ealt = new Eject()
    Ealt.Econfirm({
        title:'遥控操作',
        message:'确任发送指令吗?',
        define:function(){
            console.log(888)
            $.ajax({
                url:javaIp+'/webSocket/deviceOperation.do',
                data: {
                    group:group,
                    operation:operation,
                    timeout:timeout
                },
                type:'POST',
                dataType:'json',
                headers: {'token':token},
                success: function (res) {
                    Ealt.Etoast('指令下发成功！',2)
                },
                fail: function (err) {
                    Ealt.Etoast('指令下发失败！',2)
                }
            })
        },
        cancel:function(){

        }
    })

}
