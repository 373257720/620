/******************************************************************************
 * Web based vehicle tracker based on Freematics Hub
 * Developed by Stanley Huang https://www.facebook.com/stanleyhuangyc
 * Distributed under BSD license
 * Visit http://freematics.com/hub/api for Freematics Hub API reference
 * To obtain your Freematics Hub server key, contact support@freematics.com.au
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *******v***********************************************************************/
onResize();

function onResize() {
    var height = window.innerHeight - document.getElementById("list").offsetHeight - 8;
    var width = window.innerWidth - document.getElementById("sidebar").offsetWidth - 2;
    //if (mapHeight < 300) mapHeight = 300;
    document.getElementById("container").style.height = height + "px";
    document.getElementById("map").style.height = height + "px";
    document.getElementById("map").style.width = width + "px";
    // document.getElementById("chart").style.height = height / 3 + "px";
    // document.getElementById("chart").style.width = width+ "px";
}
// var a=NaN-1
// console.log(NaN>0.001)
var map;
var ordinal = [17, 16, 287, 14, 260, 261, 266, 350, 272, 289, 305, 307, 36]
var column = [
    'China Date',
    'China Time',
    'Run time since engine start',
    'Course (degree)',
    'Engine load',
    'Engine coolant temperature',
    'Fuel pressure',
    'Engine fuel rate',
    'MAF air flow rate',
    'Distance traveled with malfunction indicator lamp',
    'Distance traveled since codes cleared',
    'Barometric pressure',
    'Battery voltage (in 0.01V)',
];


var markers = [];
var infowindow = []; //信息墙   
// lineView = [],
// routerLog = []; //记录点清除点
// var driveLog = [];
var locations = []; //车的位置信息
var cardatas = {}; //channels数据

var data_elapsed = document.getElementById('data_elapsed');
var data_pid_value1 = document.getElementById('data_pid_value1');
var data_recv = document.getElementById('data_recv');
var data_rate = document.getElementById('data_rate');
var data_delay = document.getElementById('data_delay');
var data_pid_value0 = document.getElementById('data_pid_value0');
var carlists = document.getElementById('carlist')
var shoufengqin = document.getElementsByClassName('open')[0]


document.getElementsByClassName('open')[0].nextElementSibling.style.height = "0px"
shoufengqin.onclick = function () {
    // console.log(shoufengqin);
    xiala('open', document.getElementsByClassName('open')[0])
}
carlists.onclick = function (e) {
    if (e.target.className == 'caritem') {
        timegg(markers[e.target.getAttribute('myid')], infowindow)
    }
}
// clearInterval(timego)
// var timego = setInterval(function () {
//     for (var i = 0; i < cardatas.length; i++) {
//         if (cardatas[i].stats.parked == 0) {
//             cardatas[i].stats.elapsed = cardatas[i].stats.elapsed + 1000;
//         }

//     }
// }, 1000)

// 左边列表渲染
function show(b) {
    var res = b.map(function (item) {
        return `<li>
                    <p>${item}:</p>
                    <p class="infomation">-</p>
                </li>`;
    }).join("");


    $('#tools').html(res);
    // console.log($('#tool'))
}
// 汽车列表
function showme(b) {
    var res = b.map(function (item, idx) {
        return `<li>
                    <p class="caritem" myid=${idx} itemname=${item.devid}>${item.devid}</p>              
                </li>`;
    }).join("");
    $('#carlist').html(res);
    // console.log($('#tool'))
}

function initMap() {
    // var directionsService = new google.maps.DirectionsService;
    // var directionsDisplay = new google.maps.DirectionsRenderer;
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: {
            lat: 22.4,
            lng: 114.15
        },
        // zoomControl: false,
        // scaleControl: false
    });
    // google.maps.event.addListener(map, 'zoom_changed', function () {
    //     // console.log(111)
    //     if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
    // });
    // directionsDisplay.setMap(map);
    show(column);
    infomation = document.getElementsByClassName('infomation')
    clearInterval(go)
    var go = setInterval(NowTime, 1000)

    function NowTime() {
        var time = new Date();
        var year = time.getFullYear(); //获取年
        var month = time.getMonth() + 1; //或者月
        var day = time.getDate(); //或者天
        var hour = time.getHours(); //获取小时
        var minu = time.getMinutes(); //获取分钟
        var second = time.getSeconds(); //或者秒
        month = month < 10 ? '0' + month : month;
        day = day < 10 ? '0' + day : day;
        var data = year + "-" + month + '-' + day;
        hour = hour < 10 ? '0' + hour : hour;
        minu = minu < 10 ? '0' + minu : minu;
        second = second < 10 ? '0' + second : second;
        var time = hour + ":" + minu + ":" + second;
        infomation[0].innerText = data
        infomation[1].innerText = time
    }
    //实时位置
    setMapOnAll(null);
    // dashload();

    // google.maps.event.addDomListener(infomation[0], 'click', function(){console.log(999)});
}


function xiala(open, a) {
    // console.log(open, a.children[1]);
    if (a.className == open) {
        var he = a.nextElementSibling.children[0].offsetHeight;
        var he1 = getstyle(a.nextElementSibling, 'height');
        if (he1 == '0px') {
            startMove(a.nextElementSibling, {
                'height': he
            })
            startMove(a.children[1], {
                // transform:rotate;
            });
        } else {
            startMove(a.nextElementSibling, {
                'height': 0
            });
        }
    }
}

function getstyle(obj, name) {
    //获取样式
    if (obj.currentStyle) {
        return obj.currentStyle[name];
    } else {
        //主流浏览器
        // console.log( getComputedStyle(obj, false)['transform']);
        return getComputedStyle(obj, false)[name];
    }
}

function startMove(obj, json, fnend) {
    clearInterval(obj.timer);
    obj.timer = setInterval(function () {
        var istrue = true;
        //1.获取属性名，获取键名：属性名->初始值
        for (var key in json) {
            // console.log(key); //width heigth opacity
            var cur = 0; //存初始值
            if (key == 'opacity') {
                cur = getstyle(obj, key) * 100; //透明度
            } else {
                cur = parseInt(getstyle(obj, key)); //width heigth borderwidth px为单位的
            }
            //2.根据初始值和目标值，进行判断确定speed方向，变形：缓冲运动
            //距离越大，速度越大,下面的公式具备方向
            var speed = (json[key] - cur) / 10;
            speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed); //不要小数部分，没有这句话或晃动
            if (cur != json[key]) {
                istrue = false; //如果没有达到目标值，开关false
            } else {
                istrue = true;
            }
            //3、运动
            if (key == 'opacity') {
                obj.style.opacity = (cur + speed) / 100;
                obj.style.filter = `alpha(opacity:${cur+speed})`;
            }
            // if(key=="transform"){
            //     obj.style.transform=
            // }
            else {
                obj.style[key] = cur + speed + 'px';
            }


        }
        //4.回调函数:准备一个开关,确保以上json所有的属性都已经达到目标值,才能调用这个回调函数
        if (istrue) { //如果为true,证明以上属性都达到目标值了
            clearInterval(obj.timer);
            if (fnend) {
                fnend();
            }
        }

    }, 30); //obj.timer 每个对象都有自己定时器
}
// 点击某车辆，该车辆的信息一直更新
function change(name) {
    // data_pid_value1.innerText = name[0].devid
    var format_time = formatDuring(name.stats.elapsed)
    data_elapsed.innerText = format_time
    var lat;
    var long;
    name.data.forEach(item => {
        if (ordinal.indexOf(item[0]) > 0) {
            var a = ordinal.indexOf(item[0]);
            infomation[a].innerText = item[1]
        }
        if (item[0] == 10) {
            lat = item[1]
        }
        if (item[0] == 11) {
            long = item[1]
        }
        if (lat && long) {
            data_recv.innerText = lat + '，' + long
        }
        if (item[0] == 268) {
            data_pid_value0.innerText = item[1]
        }
        if (item[0] == 269) {
            data_rate.innerText = item[1]
        }
        if (item[0] == 273) {
            data_delay.innerText = item[1]
        }

    });
}


var image = [{
        // riding: './images/5e41539ba90eadf15c73237283914ec.png'
        pic: './images/5e41539ba90eadf15c73237283914ec.png'
    },
    {
        // havedata: './images/17f1bae155301168252cd83d890e842.png'
        pic: './images/17f1bae155301168252cd83d890e842.png'
    },
    {
        // icon: './images/0de4da971bdb1236ea9a346dbd13fd1.png',
        pic: './images/a8590e52095592eef526639279dc5fc.png'
        // parking: './images/a8590e52095592eef526639279dc5fc.png'

    },
    {
        pic: './images/0de4da971bdb1236ea9a346dbd13fd1.png',
        // offline: './images/0de4da971bdb1236ea9a346dbd13fd1.png',
    }
];

// offline
// url:'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
// This marker is 20 pixels wide by 32 pixels high.
// size: new google.maps.Size(20, 20),
// // The origin for this image is (0, 0).
// origin: new google.maps.Point(0, 0),
// // The anchor for this image is the base of the flagpole at (0, 32).
// anchor: new google.maps.Point(0, 32)


function spliceMarker(location, map, idx, img) {
    var marker = new google.maps.Marker({
        position: location,
        'draggable': false,
        map: map,
        icon: img
    });
    // markers.push(marker);
    markers.splice(idx, 1, marker)
    // console.log(markers);

    for (var i = 0; i < markers.length; i++) {
        infowindow[i] = new google.maps.InfoWindow({
            content: ''
        });
    }
    marker.addListener('click', function () {
            timegg(marker, infowindow)
        }

    );
}

// function timegg(marker, infowindow) {
//     // console.log(marker.position.lat(),marker.position.lng());

//     // console.log(markers.indexOf(marker));
//     var shuzi = markers.indexOf(marker);
//     data_pid_value1.innerText = "-";
//     data_pid_value0.innerText = '-';
//     data_recv.innerText = "-";
//     data_rate.innerText = "-";
//     data_delay.innerText = "-";
//     // var markername = marker.name
//     data_pid_value1.innerText = cardatas[shuzi].devid
//     var format_time = formatDuring(cardatas[shuzi].stats.elapsed)
//     data_elapsed.innerText = format_time
//     infomation.forEach = Array.prototype.forEach
//     infomation.forEach((item, idx) => {
//         if (idx >= 2) {
//             item.innerText = '-'
//         }

//     })
//     var lat = ''
//     var long = ''
//     cardatas[shuzi].data.forEach(item => {

//         if (ordinal.indexOf(item[0]) > 0) {
//             var a = ordinal.indexOf(item[0]);
//             infomation[a].innerText = item[1]
//             // var a = ordinal.indexOf(item[0]);
//         }
//         if (item[0] == 10) {
//             lat = item[1]
//         }
//         if (item[0] == 11) {
//             long = item[1]
//         }
//         if (lat && long) {
//             data_recv.innerText = lat + '，' + long
//         }
//         if (item[0] == 268) {
//             data_pid_value0.innerText = item[1]
//         }
//         if (item[0] == 269) {
//             data_rate.innerText = item[1]
//         }
//         if (item[0] == 273) {
//             data_delay.innerText = item[1]
//         }

//     })

//     for (var t = 0; t < infowindow.length; t++) {
//         infowindow[t].close();
//     }
//     var contentString =
//         '<div id="content">' +
//         '<div id="siteNotice">' +
//         cardatas[shuzi].devid +
//         '</div></div>';
//     infowindow[markers.indexOf(marker)] = new google.maps.InfoWindow({
//         content: contentString
//     });
//     infowindow[markers.indexOf(marker)].open(map, marker);
// }
// 毫秒转换
function formatDuring(mss) {
    // var days = parseInt(mss / (1000 * 60 * 60 * 24));
    var hours = parseInt((mss % (60 * 60 * 24)) / (60 * 60));
    hours = hours > 10 ? hours : '0' + hours;
    var minutes = parseInt((mss % (60 * 60)) / (60));
    minutes = minutes > 10 ? minutes : '0' + minutes;
    var seconds = mss % (60);
    seconds = seconds > 10 ? seconds : '0' + seconds;
    return hours + ":" + minutes + ":" + seconds;
}
//重置回放、路线记录
// function setMapLineAll(map, arrs) {
//     for (var i = 0; i < arrs.length; i++) {
//         arrs[i].setMap(map);
//     }
// }

//重置点
function setMapOnAll(map, arrs) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map); //map为null则为清除点
    }
};


if (window.require) {
    const shell = require('electron').shell;

    function openLink(url) {
        shell.openExternal(url);
    }
}

// 获取车列表
function carlist() {
    this.lastDataCount = null;
    $.ajax({
        url: serverURL + "/channels", //请求的url地址
        dataType: "json", //返回的格式为json
        async: true, //请求是否异步，默认true异步，这是ajax的特性
        type: "GET", //请求的方式
    }).then(function (res) {
        var arr1 = res.channels;
        for (let i = 0; i < arr1.length; i++) {
            {
                cardatas[arr1[i].devid] = arr1[i];
            }

        }
        // cardatas = JSON.parse(JSON.stringify(res.channels))
        // console.log(cardatas);
        if (cardatas.length == 0) {
            alert("Not an active device. Please check if your device is working or the device ID is correct.");
        }
    }, function (err) {
        console.log(err)
    });
}
carlist();
clearInterval(dashload)
// 总数据的定时器
var dashload = setInterval(carlist, 10000);


// 0=rideing;
// 1=havedata;
// 2=parking;
// 3=offline
single0();

function single0() {
    // console.log('single1 hanshudangzh');
    for (let key in cardatas) {
        (function (num) { //形参
            $.ajax({
                    async: true, //异步
                    url: serverURL + "/get/" + cardatas[num].devid,
                    type: 'get',
                    dataType: 'html'
                })
                .then(function (res) {
                    console.log(res.stats);
                    if (res.stats) {
                        var offline = res.stats.age.ping > DEVICE_OFFLINE_TIMEOUT
                        if (offline) {
                            cardatas[i]['status'] = 3
                        } else if (!offline) {
                            cardatas[i]['status'] = 2
                        }

                    } else if (!res.stats.parked) {
                        let uluru = {}
                        for (let j = 0; j < res.data.length; j++) {
                            // console.log(brr[j][1])
                            if (res.data[j][0] == 10) {
                                uluru.lat = res.data[j][1]
                            }
                            if (brr.data[j][0] == 11) {
                                uluru.lng = res.data[j][1]
                            }
                        }
                        if (uluru.lat && uluru.lng) {
                            cardatas[i]['status'] = 0
                        } else {
                            cardatas[i]['status'] = 1
                        }
                    }

                }, function (err) {
                    console.log(err)
                });
        }(key))
    }

}
//实参
// if (cardatas[i]['status'] == undefined || cardatas[i]['status'] == 0 || cardatas[i]['status'] == 1) {
//     let xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function () {
//         if (this.readyState != 4) return;
//         if (this.status != 200) {
//             if (this.status) {
//                 // alert("Server under maintenance (status: " + this.status + ")");
//             }
//             return;
//         }
//         var res = JSON.parse(xhr.responseText)
//         console.log(res);  
//         if (res.stats.parked) {
//             var offline = res.stats.age.ping > DEVICE_OFFLINE_TIMEOUT
//             if (offline) {
//                 cardatas[i]['status'] = 3
//             } else if (!offline) {
//                 cardatas[i]['status'] = 2
//             }

//         } else if (!res.stats.parked) {
//             let uluru={} 
//             for (let j = 0; j < res.data.length; j++) {
//                 // console.log(brr[j][1])
//                 if (res.data[j][0] == 10) {
//                     uluru.lat = res.data[j][1]
//                 }
//                 if (brr.data[j][0] == 11) {
//                     uluru.lng = res.data[j][1]
//                 }
//             }
//             if(uluru.lat&&uluru.lng){
//                 cardatas[i]['status'] = 0
//             }else{
//                 cardatas[i]['status'] = 1
//             }
//         }
//     }
//     xhr.open('get', serverURL + "/get/" + cardatas[i].devid);
//     xhr.send();
// }


// single0();

// 车的状态
var dashload0 = setInterval(single0, 5000);

function single1() {
    // console.log('single1 hanshudangzh');
    for (let i in cardatas) {
        // console.log(cardatas);
        if (cardatas[i]['status'] == 2) {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState != 4) return;
                if (this.status != 200) {
                    if (this.status) {
                        // alert("Server under maintenance (status: " + this.status + ")");
                    }
                    return;
                }
                var res = JSON.parse(xhr.responseText)
                console.log(res);
            }
            xhr.open('get', serverURL + "/get/" + cardatas[i].devid);
            xhr.send();
        }
    }
    console.log(1);
}
// var dashload0 = setInterval(single1, 10000);

function single2() {
    // console.log('single1 hanshudangzh');
    for (let i in cardatas) {
        // console.log(cardatas);
        if (cardatas[i]['status'] == 3) {
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (this.readyState != 4) return;
                if (this.status != 200) {
                    if (this.status) {
                        // alert("Server under maintenance (status: " + this.status + ")");
                    }
                    return;
                }
                var res = JSON.parse(xhr.responseText)
                console.log(res);
            }
            xhr.open('get', serverURL + "/get/" + cardatas[i].devid);
            xhr.send();
        }
    }
    console.log(1);
}
// var dashload0 = setInterval(single2, 10000);





// 遍历车列表
// var instantdata = function (data) {
//     console.log(data);
//     locations = [];
//     // console.log(data)
//     for (let i = 0; i < data.length; i++) {
//         if (data[i].park) {
//             var offline = data[i].stats.age.ping > DEVICE_OFFLINE_TIMEOUT
//             if (offline) {
//                 setInterval(() => {}, 30000)
//             } else if (!offline) {

//             }

//         } else if (!data[i].park) {
//             if (uluru.lat && uluru.lng) {

//             } else {

//             }
//         }
//         locations.push(new Promise((resolve, reject) => {

//         }))
//     }
//     Promise.all(locations)
//         .then(locations => {
//             console.log(locations);
//             showme(locations);
//             for (let i = 0; i < locations.length; i++) {
//                 var uluru = {}; //坐标
//                 var brr = locations[i] //每台车的data      
//                 for (let j = 0; j < brr.data.length; j++) {
//                     // console.log(brr[j][1])
//                     if (brr.data[j][0] == 10) {
//                         uluru.lat = brr.data[j][1]
//                     }
//                     if (brr.data[j][0] == 11) {
//                         uluru.lng = brr.data[j][1]
//                     }
//                 }
//                 var park = brr.stats.parked
//                 if (park) {
//                     var offline = brr.stats.age.ping > DEVICE_OFFLINE_TIMEOUT
//                     if (offline) {
//                         brr.status = 3;
//                         if (markers[i] && cardatas[i].status != 3) {
//                             // cardatas[i].status = 4
//                             markers[i].setMap(null)
//                             spliceMarker({
//                                 lat: markers[i].position.lat(),
//                                 lng: markers[i].position.lng()
//                             }, map, i, image[3].pic)
//                         }
//                     } else if (!offline) {
//                         brr.status = 2
//                         if (markers[i] && cardatas[i].status != 2) {
//                             // cardatas[i].status = 3
//                             markers[i].setMap(null)
//                             spliceMarker({
//                                 lat: markers[i].position.lat(),
//                                 lng: markers[i].position.lng()
//                             }, map, i, image[2].pic)
//                         }
//                     }
//                 } else {
//                     if (uluru.lat && uluru.lng) {
//                         brr.status = 0
//                         if (markers[i]) {

//                             if (cardatas[i].status != 0) {
//                                 markers[i].setMap(null)
//                                 spliceMarker({
//                                     lat: uluru.lat,
//                                     lng: uluru.lng
//                                 }, map, i, image[0].pic)
//                             } else if (Math.abs(markers[i].position.lat() - uluru.lat) > 0.001 || Math.abs(markers[i].position.lng() - uluru.lng > 0.001)) {
//                                 markers[i].setMap(null)
//                                 spliceMarker({
//                                     lat: uluru.lat,
//                                     lng: uluru.lng
//                                 }, map, i, image[0].pic)
//                             }
//                         }
//                     } else {
//                         brr.status = 1
//                         if (markers[i] && cardatas[i].status != 1) {
//                             // cardatas[i].status = 2
//                             markers[i].setMap(null)
//                             spliceMarker({
//                                 lat: markers[i].position.lat(),
//                                 lng: markers[i].position.lng()
//                             }, map, i, image[1].pic)
//                         }
//                     }

//                 }
//                 if (markers[i]) {
//                     cardatas.splice(i, 1, brr)
//                 } else {
//                     // console.log(uluru.lat,uluru.lng);    
//                     if (uluru.lat && uluru.lng) {
//                         spliceMarker({
//                             lat: uluru.lat,
//                             lng: uluru.lng
//                         }, map, cardatas.length, image[brr.status].pic)

//                     } else {
//                         spliceMarker({
//                             lat: 22.4271338,
//                             lng: 114.2094371
//                         }, map, cardatas.length, image[brr.status].pic)
//                     }
//                     // console.log(markers);

//                     cardatas.splice(cardatas.length, 1, brr)

//                 }

//                 if (data_pid_value1.innerText == brr.devid) {
//                     change(cardatas[i])
//                 }
//             }
//         })
//         .then(() => {

//             // clearTimeout(timeup)
//             // var timeup = setTimeout(function () {
//             //     DASH.load()
//             // }, 5000)
//         })

// }
var DASH = {
    xhr: new XMLHttpRequest(),
    dataSlideIndex: [0, 1],
    deviceID: null,
    curLocation: null,
    data: null,
    chart: null,
    chartPID: null,
    chartDataTick: 0,
    selectedPID: 269,
    lastDataCount: null,
    parked: null,




    selectPID: function (pid) {
        this.selectedPID = pid;
    },
    setText: function (name, text) {
        document.getElementById("data_" + name).innerText = text;
    },
    setClass: function (name, className) {
        document.getElementById("data_" + name).className = className;
    },
    setHTML: function (name, html) {
        document.getElementById("data_" + name).innerHTML = html;
    },
    setTempBar: function (name, temp) {
        if (temp < 0) temp = 0;
        if (temp > 80) temp = 80;
        var i = Math.floor((temp / 80) * 45) * 34;
        var img = document.getElementById("data_" + name);
        img.style.marginLeft = (-i) + "px";
        img.title = temp + "C";
    },
    // togglePID: function (num) {
    //     if (this.data.length > num) {
    //         if (++this.dataSlideIndex[num] >= this.data.length) this.dataSlideIndex[num] = 0;
    //         if (this.dataSlideIndex[num] == this.dataSlideIndex[1 - num]) {
    //             if (++this.dataSlideIndex[num] >= this.data.length) this.dataSlideIndex[num] = 0;
    //         }
    //         this.updatePID(num);
    //     }
    // },
    getPIDValue: function (pid) {
        for (var i = 0; i < this.data.length; i++) {
            if (this.data[i][0] == pid) {
                return PID.normalize(pid, this.data[i][1]);
            }
        }
        return null;
    },
    updatePID: function (num) {
        var dataIndex = this.dataSlideIndex[num];
        if (dataIndex < this.data.length) {
            var pid = this.data[dataIndex][0];
            var value = this.data[dataIndex][1];
            this.setText("pid_value" + num.toString(), PID.normalize(pid, value));
            this.setText("pid_name" + num.toString(), PID.getNameUnit(pid));
        }
    },
    // updateUserInfo: function (info, devid) {
    //     if (!USER.info) {
    //         document.getElementById("info").innerHTML = devid ? ("DEVICE: " + devid) : "";
    //         return;
    //     }
    //     var s = "<select onchange='USER.goDash(this.value)'>";
    //     var found = false;
    //     for (var i = 0; i < info.devid.length; i++) {
    //         s += "<option value=\"" + info.devid[i] + "\"";
    //         if (info.devid[i] == devid) {
    //             s += " selected";
    //             found = true;
    //         }
    //         s += ">" + info.devid[i] + "</option>";
    //     }
    //     if (!found) {
    //         s += "<option value=\"" + devid + "\" selected>" + devid + "</option>";
    //     }
    //     s += "</select><input type='button' onclick='USER.goNextDash(previousSibling.value)' value='Switch'></input>";
    //     document.getElementById("info").innerHTML = s;
    // },
    pickNewestData: function (data) {
        var index = [-1, -1];
        var ts = 0;
        for (var i = 0; i < data.length; i++) {
            if (ts == 0 || data[i][2] < ts) {
                index[0] = i;
                ts = data[i][2];
            }
        }
        ts = 0;
        for (var i = 0; i < data.length; i++) {
            if (i == index[0]) continue;
            if (ts == 0 || data[i][2] < ts) {
                index[1] = i;
                ts = data[i][2];
            }
        }
        if (index[0] >= 0) this.dataSlideIndex[0] = index[0];
        if (index[1] >= 0) this.dataSlideIndex[1] = index[1];
    },
    update: function (ch) {
        this.parked = ch.stats.parked || ch.stats.age.data > TRIP_END_TIMEOUT;
        if (this.parked) {
            this.setText("elapsed", getHHMM(Math.floor(ch.stats.age.data / 1000)));
            var offline = ch.stats.age.ping > DEVICE_OFFLINE_TIMEOUT;
            if (offline) {
                this.setText("state", "OFFLINE");
                this.setClass("state", "state_offline");
            } else {
                this.setText("state", "PARKED");
                this.setClass("state", "state_parked");
            }
            this.setText("rate", "-");
            this.setText("delay", "-");
            if (!offline) {
                this.pickNewestData(ch.data);
            }
        } else {
            this.setText("elapsed", getHHMMSS(ch.stats.elapsed));
            this.setText("state", "RUNNING");
            this.setClass("state", "state_running");
            this.setText("rate", ch.stats.rate);
            this.setText("delay", ch.stats.age.data);
            this.setText("recv", Math.floor(ch.stats.recv / 1024));
        }

        this.data = ch.live;

        var deviceTemp = this.getPIDValue(PID.DEVICE_TEMP);
        if (deviceTemp != null) {
            this.setTempBar("temp", deviceTemp);
        }

        this.updatePID(0);
        this.updatePID(1);

        // update data grid
        var s = "<hr/><span class='smaller_text'>Timestamp </span>" + ch.stats.devtick;
        for (var n = 0; n < this.data.length; n++) {
            var pid = this.data[n][0];
            var value = this.data[n][1];
            s += "<br/><span class='smaller_text'>" + PID.getName(pid) + " </span>" + PID.normalize(pid, value);
            var unit = PID.getUnit(pid);
            if (unit) s += "<span class='small_text'> " + unit + "</span>";
        }
        document.getElementById("grid").innerHTML = s;

        if (this.lastDataCount != this.data.length) {
            s = "<hr/>Chart Data<br/><select id='chartPIDselect' onchange='DASH.selectPID(parseInt(value))'>";
            for (var n = 0; n < this.data.length; n++) {
                var pid = this.data[n][0];
                if (!PID.illustratable(pid)) continue;
                s += "<option value='" + pid + "'";
                if (pid == this.selectedPID) s += " selected";
                s += ">" + PID.getName(pid) + "</option>";
            }
            s += "</select>";
            document.getElementById("tools").innerHTML = s;
            this.lastDataCount = this.data.length;
            this.selectedPID = parseInt(document.getElementById("chartPIDselect").value);
        }
        // update map
        var lat = this.getPIDValue(PID.GPS.LATITUDE);
        var lng = this.getPIDValue(PID.GPS.LONGITUDE);
        if (lat != null && lng != null && lat != 0 && lng != 0) {
            if (!OSMAP.map) OSMAP.init("map", lat, lng, 15);
            //if (devid) OSMAP.setTooltip(0, devid);
            if (!this.curLocation || this.curLocation[0] != lat || this.curLocation[1] != lng) {
                this.curLocation = [lat, lng];
                OSMAP.setMarker(0, this.curLocation);
                OSMAP.setCenter(this.curLocation);
            }
        }
    },

    showChart: function () {
        var pid = this.selectedPID;
        this.xhr.onreadystatechange = function () {
            if (this.readyState != 4 || this.status != 200) {
                return;
            }
            var pull = JSON.parse(this.responseText);

            if (pull.error) {
                alert(pull.error);
                return;
            }

            var mydata = [];
            // load history data;
            var d = new Date();
            var tm = d.getTime() - d.getTimezoneOffset() * 60000;
            var lastDataTick = pull.stats.devtick;
            for (var i = 0; i < pull.data.length; i++) {
                var value = pull.data[i][2];
                var ts = pull.data[i][0];
                mydata.push({
                    x: tm - (lastDataTick - ts),
                    y: PID.toNumber(pid, value)
                });
            }
            // create chart with loaded data
            var chart = CreateChart(
                "chart", PID.getName(pid), "#808080",
                PID.getUnit(pid), PID.getNameUnit(pid), 100, mydata);
            // start receiving
            chart.series[0].setVisible(true, true);
            DASH.chart = chart;
            DASH.chartPID = pid;
            DASH.chartDataTick = lastDataTick;
            DASH.update(pull);
            self.setTimeout("DASH.updateData()", DATA_FETCH_INTERVAL);
            //requestData();
        };

        this.chart = null;
        document.getElementById("chart").innerHTML = "";
        var rollback = this.parked ? ROLLBACK_TIME_PARKED : ROLLBACK_TIME;
        this.xhr.open('GET', serverURL + "pull/" + this.deviceID + "?pid=" + pid + "&rollback=" + rollback, true);
        this.xhr.send(null);
    },
    updateData: function () {
        this.xhr.onreadystatechange = function () {
            if (this.readyState != 4) return;
            if (this.status != 200) {
                if (this.status) {
                    alert("Server under maintenance (status: " + this.status + ")");
                }
                return;
            }
            var pull = JSON.parse(this.responseText);
            if (pull.data.length > 0) {
                var lastDataTick = pull.stats.devtick;
                var d = new Date();
                var tm = d.getTime() - d.getTimezoneOffset() * 60000;
                for (var i = 0; i < pull.data.length; i++) {
                    var ts = pull.data[i][0];
                    var pid = pull.data[i][1];
                    var value = pull.data[i][2];
                    var x = tm - (lastDataTick - ts);
                    var y = PID.toNumber(pid, value);
                    DASH.chart.series[0].addPoint([x, y], false, true);
                }
                DASH.chartDataTick = lastDataTick;
                DASH.chart.series[0].setVisible(true, true);
            }
            DASH.update(pull);
            self.setTimeout("DASH.updateData()", DATA_FETCH_INTERVAL);
        };
        if (this.selectedPID != this.chartPID) {
            this.showChart();
            return;
        }
        if (!this.chartPID || !this.chart) return;
        var url = serverURL + "pull/" + this.deviceID + "?pid=" + DASH.chartPID + "&ts=" + (this.chartDataTick + 1);
        this.xhr.open('GET', url, true);
        this.xhr.send(null);
    },

};