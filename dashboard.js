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

// var map;
onResize();
function onResize() {
    var height = window.innerHeight - document.getElementById("list").offsetHeight;
    console.log(window.innerHeight,document.getElementById("list").offsetHeight);
    var width = window.innerWidth - document.getElementById("sidebar").offsetWidth-2;
    //if (mapHeight < 300) mapHeight = 300;
    document.getElementById("container").style.height = height+'px';
    document.getElementById("map").style.height = height+'px';
    // document.getElementById("map").style.width = width+'px';
    // document.getElementById("map").style.height = 100%;
    // document.getElementById("map").style.width = '100%';
    // document.getElementById("chart").style.height = height / 3 + "px";
    // document.getElementById("chart").style.width = width+ "px";
}
// 地图初始化
var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 11,
    center: {
        lat: 22.4,
        lng: 114.15
    },
    // zoomControl: false,
    // scaleControl: false
});
carlist();
setMapOnAll(null);
// var ordinal = [17, 16, 287, 14, 260, 261, 266, 350, 272, 289, 305, 307, 36]
var ordinal=[17,16,271,14,130,260,261,15,12,270,32,36]
var column = [
    'China Date',
    'China Time',
    // 'Run time since engine start', //0x11f-287
   ' Intake air temperature</br>(Celsius degree)',//10f-271
    'Course (degree)', //0xe-14
    'CPU temperature</br>(Celsius degree)',//0x82-130
    'Engine load(%)', //0x104-260
    'Engine coolant temperature<br>(Celsius degree)', //105-261
    'Number of satellites in use',//0xF -15
    // 'Fuel pressure', //0x10a-266
    'Altitude (m)',//0xC-12
    // 'Engine fuel rate', //0x15e-350
    // 'MAF air flow rate', //0x110-272
    // 'Distance traveled with malfunction indicator lamp', //0x121-289
    // 'Distance traveled since codes cleared', //0x131-305
    'Timing advance',  //0x10e-270
    // 'Barometric pressure', //0x133-307
    'Accelerometer data (x:y:z)',//0x20-32 
    'Battery voltage (in 0.01V)', //0x24-36
];


var markers = {}; //坐标
var infowindow = {}; //信息墙   
var cardatas = {}; //channels数据
var dingshi0 = null; //汽车在开的定时器
var dingshi2 = null; //parked的定时器
var dingshi3 = null; //offline的定时器
var data_elapsed = document.getElementById('data_elapsed');
var data_pid_value1 = document.getElementById('data_pid_value1');
var data_recv = document.getElementById('data_recv');
var data_rate = document.getElementById('data_rate');
var data_delay = document.getElementById('data_delay');
var data_pid_value0 = document.getElementById('data_pid_value0');
var carlists = document.getElementById('carlist')
var shoufengqin = document.getElementsByClassName('open')[0]
document.getElementsByClassName('open')[0].nextElementSibling.style.height = '0px';
shoufengqin.onclick = function () {
    xiala('open', document.getElementsByClassName('open')[0])
}
carlists.onclick = function (e) {
    if (e.target.className == 'caritem') {
        timegg(markers[e.target.getAttribute('myid')], infowindow)
    }
}


if (window.require) {
    const shell = require('electron').shell;

    function openLink(url) {
        shell.openExternal(url);
    }
}
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
show(column);
infomation = document.getElementsByClassName('infomation')
// console.log();

function getLocalTime(i) {
    //参数i为时区值数字，比如北京为东八区则输进8,西5输入-5
    if (typeof i !== 'number') return;
    var d = new Date();
    //得到1970年一月一日到现在的秒数
    var len = d.getTime();
    //本地时间与GMT时间的时间偏移差
    var offset = d.getTimezoneOffset() * 60000;
    //得到现在的格林尼治时间
    var utcTime = len + offset;
    return new Date(utcTime + 3600000 * i);
}
clearInterval(go)
var go = setInterval(NowTime1, 1000)

function NowTime1() {
    var time = getLocalTime(8);
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
    var time1 = hour + ":" + minu + ":" + second;
    infomation[0].innerText = data;
    infomation[1].innerText = time1;
}


// 汽车列表下拉
function xiala(open, a) {
    // console.log(open, a.children[1]);
    if (a.className == open) {
        var he = a.nextElementSibling.children[0].offsetHeight;        
        var he1 = getstyle(a.nextElementSibling, 'height');
        if (he1 =='0px') {
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
// 过渡动画
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
                obj.style[key] = (cur + speed)+ 'px';
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
// 坐标图片
var image = [{
        url: './images/10ae17a67295ba9fda383e7f28fafa0.png',
    },
    {
        url: './images/d035900196c27754147c8e5a380e6ae.png'
    },
    {
        url: './images/3a97dc98460fca4892a4bee89b55814.png'
    },
    {
        url: './images/023eeb6158ddcc440ac74b78fc9350a.png',    
    }
];


// 秒转换
function formatDuring(mss) {
    // var days = parseInt(mss / (1000 * 60 * 60 * 24));
    var hours = parseInt((mss % (60 * 60 * 24)) / (60 * 60));
    hours = hours >= 10 ? hours : '0' + hours;
    var minutes = parseInt((mss % (60 * 60)) / (60));
    minutes = minutes >= 10 ? minutes : '0' + minutes;
    var seconds = mss % (60);
    seconds = seconds >= 10 ? seconds : '0' + seconds;
    return hours + ":" + minutes + ":" + seconds;
}
//重置回放、路线记录
// function setMapLineAll(map, arrs) {
//     for (var i = 0; i < arrs.length; i++) {
//         arrs[i].setMap(map);
//     }
// }

//重置点
function setMapOnAll(map) {
    for (let i in markers) {
        markers[i].setMap(map)
    }
};




// 获取车列表
function carlist() {
    // this.lastDataCount = null;
    $.ajax({
        url: serverURL + "/channels", //请求的url地址
        dataType: "json", //返回的格式为json
        async: true, //请求是否异步，默认true异步，这是ajax的特性
        type: "GET", //请求的方式
    }).then(function (res) {
        var arr1 = res.channels;
        for (let i = 0; i < arr1.length; i++) {
            if (!cardatas[arr1[i].devid]) {
                cardatas[arr1[i].devid] = arr1[i];
            }
        }
        html = '';
        for (let i in cardatas) {
            html += `<li>
                    <p class="caritem" myid=${i} itemname=${cardatas[i].devid}>${cardatas[i].devid}</p>
            </li>`
        }
        // image[num1].url += "#" + cardatas[key].devid;
        $('#carlist').html(html);
        single0();
    }, function (err) {
        console.log(err)
    });
}
// clearInterval(dashload)
// 总数据的定时器
var dashload = setInterval(carlist, 10000);

// 在地图添加坐标
function spliceMarker(location, map, idx, img) {
    var marker = new google.maps.Marker({
        position: location,
        'draggable': false,
        map: map,
        icon: img,
        key: idx,
        
    });
    markers[idx] = marker;
    for (let i in markers) {
        infowindow[i] = new google.maps.InfoWindow({
            content: ''
        });
    }
    marker.addListener('click', function () {
        timegg(marker, infowindow)
    });

}
// function update()
function timegg(marker, infowindow) {
    // console.log(cardatas[marker.key])    
    var eachname = cardatas[marker.key]
    data_pid_value1.innerText = "-";
    data_pid_value0.innerText = '-';
    data_recv.innerText = "-";
    data_rate.innerText = "-";
    data_delay.innerText = "-";
    data_pid_value1.innerText = eachname.devid
    var format_time = formatDuring(eachname.elapsed)
    data_elapsed.innerText = format_time;
    infomation.forEach = Array.prototype.forEach
    infomation.forEach((item, idx) => {
        if (idx > 1) {
            item.innerText = '-';
        }
    })
    change1(eachname.data);
    for (let j in infowindow) {
        infowindow[j].close();
    }
    var contentString =
        '<div id="content">' +
        '<div id="siteNotice">' +
        eachname.devid +
        '</div></div>';
    infowindow[marker.key] = new google.maps.InfoWindow({
        content: contentString
    });
    infowindow[marker.key].open(map, marker);
}

function change1(eachnamedata) {
    var lat = '';
    var long = '';
    if (eachnamedata) {
        eachnamedata.forEach(item => {
            if (ordinal.indexOf(item[0]) > 1) {
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
                data_recv.innerText = lat + ',' + long
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
        })
    }
}
// 点击某车辆，该车辆的信息一直更新
function update1(name) {
    data_pid_value0.innerText = '-';
    data_rate.innerText = "-";
    data_delay.innerText = "-";
    // var format_time = formatDuring(name.elapsed)
    // data_elapsed.innerText = format_time
    infomation.forEach = Array.prototype.forEach
    infomation.forEach((item, idx) => {
        if (idx >= 2) {
            item.innerText = '-'
        }
    })
    change1(name.data)
}

// 新添加的车放入汽车列表
function single0() {
    for (let key in cardatas) {
        // var arrlen = Object.keys(cardatas).length;       
        (function (num) { //形参 
            if (!cardatas[key]['status'] && cardatas[key]['status'] != 0) {
                $.ajax({
                        async: true, //异步
                        url: serverURL + "/get/" + cardatas[num].devid,
                        type: 'get',
                        dataType: 'html'
                    })
                    .then(function (result) {
                        // var res = eval('(' + result + ')');
                        var res = JSON.parse(result)
                        let uluru = {}
                        for (let j = 0; j < res.data.length; j++) {
                            // console.log(brr[j][1])
                            if (res.data[j][0] == 10) {
                                uluru.lat = res.data[j][1]
                            }
                            if (res.data[j][0] == 11) {
                                uluru.lng = res.data[j][1]
                            }
                        }
                        if (res.stats.parked) {
                            var offline = res.stats.age.ping > DEVICE_OFFLINE_TIMEOUT
                            if (offline) {
                                create1(key, 3, 3, uluru)

                            } else if (!offline) {
                                create1(key, 2, 2, uluru)
                            }
                        } else if (!res.stats.parked) {
                            create1(key, 0, 1, uluru)

                        }
                        cardatas[key].data = res.data
                        cardatas[key].elapsed = res.stats.elapsed;
                        states(cardatas[key]);
                    });
            }
        })(key)
    }
    // console.log(cardatas);
};



// google.maps.event.addDomListener(window, 'load', initMap)
function create1(key, num1, num2, uluru) {  
    if (uluru.lat & uluru.lng) {
        // var p = image[num1].url;
        // p += "#" + cardatas[key].devid;
        cardatas[key]['status'] = num1;
        spliceMarker({
            lat: uluru.lat,
            lng: uluru.lng
        }, map, key, image[num1]);
        // rotateMarker(cardatas[key].devid, 90);
    } else {
        cardatas[key]['status'] = num2
        spliceMarker({
            lat: 22.4271338,
            lng: 114.2094371
        }, map, key, image[num2])
    }
}

function judgement(carid, number) {
    markers[carid].setMap(null)
    spliceMarker({
        lat: markers[carid].position.lat(),
        lng: markers[carid].position.lng()
    }, map, carid, image[number])
    cardatas[carid].status = number
}

// 0=riding;
// 1=havedata;
// 2=parking;
// 3=offline
function states(car) {
    if (car.status == 0 || car.status == 1) {
        clearTimeout(dingshi0)
        dingshi0 = setTimeout(() => {
            single1(car)
        }, 2000)
    } else if (car.status == 2) {
        clearTimeout(dingshi2)
        dingshi2 = setTimeout(() => {
            // console.log(2)   
            single1(car)
        }, 5000)
    } else if (car.status == 3) {
        clearTimeout(dingshi3)
        dinshiqi3 = setTimeout(() => {
            // console.log(3)
            single1(car);
        }, 30000);
    }
}

function single1(car) {
    $.ajax({
            async: true, //异步
            url: serverURL + "/get/" + car.devid,
            type: 'get',
            dataType: 'html'
        })
        .then(function (result) {
            var res = JSON.parse(result);
            let uluru = {}
            for (let j = 0; j < res.data.length; j++) {
                if (res.data[j][0] == 10) {
                    uluru.lat = res.data[j][1]
                }
                if (res.data[j][0] == 11) {
                    uluru.lng = res.data[j][1]
                }
            }
            if (res.stats.parked) {
                var offline = res.stats.age.ping > DEVICE_OFFLINE_TIMEOUT
                if (offline) {
                    if (cardatas[car.devid].status != 3) {
                        judgement(car.devid, 3)
                    }
                } else if (!offline) {
                    if (cardatas[car.devid].status != 2) {
                        judgement(car.devid, 2)
                    }
                }
                cardatas[car.devid].parked = 1;
            } else if (!res.stats.parked) {
                if (uluru.lat && uluru.lng) {
                    if (cardatas[car.devid].status != 0) {
                        judgement(car.devid, 0)
                    } else if (Math.abs(markers[car.devid].position.lat() - uluru.lat) > 0.0001 || Math.abs(markers[car.devid].position.lng() - uluru.lng) > 0.0001) {
                        markers[car.devid].setMap(null)
                        spliceMarker({
                            lat: uluru.lat,
                            lng: uluru.lng
                        }, map, car.devid, image[0])
                    }
                } else {
                    if (cardatas[car.devid].status != 1) {
                        judgement(car.devid, 1)
                    }
                }
                cardatas[car.devid].data = res.data
                cardatas[car.devid].parked = 0;
                // console.log('new' + res.stats.elapsed);
                if (cardatas[car.devid].old_elapsed && cardatas[car.devid].old_elapsed < res.stats.elapsed) {
                    cardatas[car.devid].nowelapsed = res.stats.elapsed;
                } else if (!cardatas[car.devid].old_elapsed) {
                    cardatas[car.devid].old_elapsed = res.stats.elapsed;
                    cardatas[car.devid].elapsed = res.stats.elapsed;
                }
            }
            if (data_pid_value1.innerText == car.devid) {
                update1(car)
            }
            states(car);
        });
}

// 校正时间
var Timestamp = setInterval(function () {
    for (let key in cardatas) {
        if (!cardatas[key].parked) {
            // console.log(cardatas[key].old_elapsed,cardatas[key].nowelapsed);      
            if (cardatas[key].old_elapsed < cardatas[key].nowelapsed) {
                cardatas[key].old_elapsed = cardatas[key].nowelapsed
                cardatas[key].elapsed = cardatas[key].nowelapsed
            } else {
                cardatas[key].elapsed = cardatas[key].elapsed + 1
            }
        }
        if (data_pid_value1.innerText == cardatas[key].devid) {
            var format_time = formatDuring(cardatas[key].elapsed)
            data_elapsed.innerText = format_time
        }
    }
}, 1000)




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
        img.style.marginLeft = (-i)/100 + "rem";
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