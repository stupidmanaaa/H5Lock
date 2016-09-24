/**
 * Created by huangwenbin on 16/9/23.
 */
//http://www.nihaoshijie.com.cn/index.php/archives/537http://www.nihaoshijie.com.cn/index.php/archives/537
/*
 http://top.jobbole.com/22960/
 http://threejs.org/examples/
 http://www.inf.usi.ch/phd/wettel/codecity-download.html
 https://github.com/lvming6816077/H5lock
 http://www.alloyteam.com/2015/07/html5-shi-xian-ping-mu-shou-shi-jie-suo/
 */

(function () {
    window.H5lock = function (obj) {
        this.height = obj.height;
        this.width = obj.width;
        this.chooseType = Number(window.localStorage.getItem('chooseType')) || obj.chooseType;
    };


    H5lock.prototype.drawCle = function (x, y) { // 初始化解锁密码面板
        this.ctx.strokeStyle = '#CFE6FF';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    };
    H5lock.prototype.drawPoint = function () { // 初始化圆心
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.fillStyle = '#CFE6FF';
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r / 2, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.fill();
        }
    };
    H5lock.prototype.drawStatusPoint = function (type) { // 初始化状态线条
        for (var i = 0; i < this.lastPoint.length; i++) {
            this.ctx.strokeStyle = type;
            this.ctx.beginPath();
            this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
        }
    };
    H5lock.prototype.drawLine = function (po, lastPoint) {// 解锁轨迹
        this.ctx.beginPath();
        this.ctx.lineWidth = 3;
        this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
        console.log(this.lastPoint.length);
        for (var i = 1; i < this.lastPoint.length; i++) {
            this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
        }
        this.ctx.lineTo(po.x, po.y);
        this.ctx.stroke();
        this.ctx.closePath();

    };
    H5lock.prototype.createCircle = function () {// 创建解锁点的坐标，根据canvas的大小来平均分配半径

        var n = this.chooseType;
        var count = 0;
        this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
        this.lastPoint = [];
        this.arr = [];
        this.restPoint = [];
        var r = this.r;
        for (var i = 0; i < n; i++) {
            for (var j = 0; j < n; j++) {
                count++;
                var obj = {
                    x: j * 4 * r + 3 * r,
                    y: i * 4 * r + 3 * r,
                    index: count
                };
                this.arr.push(obj);
                this.restPoint.push(obj);
            }
        }
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        for (var i = 0; i < this.arr.length; i++) {
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }
        //return arr;
    };
    H5lock.prototype.getPosition = function (e) {// 获取touch点相对于canvas的坐标
        var rect = e.currentTarget.getBoundingClientRect();
        var po = {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
        return po;
    };
    H5lock.prototype.update = function (po) {// 核心变换方法在touchmove时候调用
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for (var i = 0; i < this.arr.length; i++) { // 每帧先把面板画出来
            this.drawCle(this.arr[i].x, this.arr[i].y);
        }

        this.drawPoint(this.lastPoint);// 每帧花轨迹
        this.drawLine(po, this.lastPoint);// 每帧画圆心

        for (var i = 0; i < this.restPoint.length; i++) {
            if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                this.lastPoint.push(this.restPoint[i]);
                this.restPoint.splice(i, 1);
                break;
            }
        }

    };
    H5lock.prototype.checkPass = function (psw1, psw2) {// 检测密码
        var p1 = '',
            p2 = '';
        for (var i = 0; i < psw1.length; i++) {
            p1 += psw1[i].index + psw1[i].index;
        }
        for (var i = 0; i < psw2.length; i++) {
            p2 += psw2[i].index + psw2[i].index;
        }
        return p1 === p2;
    };
    H5lock.prototype.storePass = function (psw) {// touchend结束之后对密码和状态的处理
        if (this.pswObj.step == 1) {
            if (this.checkPass(this.pswObj.fpassword, psw)) {
                this.pswObj.step = 2;
                this.pswObj.spassword = psw;
                document.getElementById('title').innerHTML = '密码保存成功';
                this.drawStatusPoint('#2CFF26');

                /**
                 * 这里将用户的账号密码存储到后台服务器中
                 */
                // window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword));
                // window.localStorage.setItem('chooseType', this.chooseType);
                alert("这里存储密码到后台" + "密码 : "+JSON.stringify(this.pswObj.spassword));
            } else {
                document.getElementById('title').innerHTML = '两次不一致，重新输入';
                this.drawStatusPoint('red');
                delete this.pswObj.step;
            }
        } else if (this.pswObj.step == 2) {
            if (this.checkPass(this.pswObj.spassword, psw)) {
                // document.getElementById('title').innerHTML = '解锁成功';
                alert("解锁成功!跳转到主界面!");
                window.location.href = "loginFinish.html";

                this.drawStatusPoint('#2CFF26');
            } else {
                this.drawStatusPoint('red');
                document.getElementById('title').innerHTML = '解锁失败';
            }
        } else {
            this.pswObj.step = 1;
            this.pswObj.fpassword = psw;
            document.getElementById('title').innerHTML = '再次输入';
        }

    };

    // 设置此时的状态是设置密码还是输入密码
    H5lock.prototype.makeState = function () {
        if (this.pswObj.step == 2) { // 如果用户已经设置了密码(即在localstorage中有该数据)
            document.getElementById('updatePassword').style.display = 'block';
            //document.getElementById('chooseType').style.display = 'none';
            document.getElementById('title').innerHTML = '请解锁';
        } else if (this.pswObj.step == 1) { // 如果没有
            //document.getElementById('chooseType').style.display = 'none';
            document.getElementById('updatePassword').style.display = 'none';
        } else {
            document.getElementById('updatePassword').style.display = 'none';
            //document.getElementById('chooseType').style.display = 'block';
        }
    };
    H5lock.prototype.setChooseType = function (type) {
        chooseType = type;
        init();
    };
    // 更新用户密码
    H5lock.prototype.updatePassword = function () {

        /**
         * 用户重置密码
         */
        // window.localStorage.removeItem('passwordxx');
        // window.localStorage.removeItem('chooseType');


        this.pswObj = {};
        document.getElementById('title').innerHTML = '绘制解锁图案';
        this.reset();
    };
    H5lock.prototype.initDom = function () {
        var wrap = document.createElement('div');
        var str = '<h4 id="title" class="title">绘制解锁图案</h4>' +
            '<a id="updatePassword" style="position: absolute;right: 5px;top: 5px;color:#fff;font-size: 10px;display:none;">重置密码</a>' +
            '<canvas id="canvas" width="300" height="300" style="background-color: #305066;display: inline-block;margin-top: 15px;"></canvas>';
        wrap.setAttribute('style', 'position: absolute;top:0;left:0;right:0;bottom:0;');
        wrap.innerHTML = str;
        document.body.appendChild(wrap);
    };
    H5lock.prototype.init = function () {
        this.initDom();

        /**
         * 获取密码(从后台服务器获取密码)
         */
        // this.pswObj = window.localStorage.getItem('passwordxx') ? {
        //     step: 2,
        //     spassword: JSON.parse(window.localStorage.getItem('passwordxx'))
        // } : {};
        this.pswObj = {
            step : 2 ,
            spassword : [{index : 1} , {index : 2} , {index : 3}]
        };
        this.lastPoint = [];
        // 设置当前状态(1,解锁状态  2,设置密码状态)
        this.makeState();
        // 标志开始解锁动作
        this.touchFlag = false;
        // 获取画板
        this.canvas = document.getElementById('canvas');
        // 获取
        this.ctx = this.canvas.getContext('2d');
        // 开始画圆
        this.createCircle();
        // 绑定事件
        this.bindEvent();
    };
    H5lock.prototype.reset = function () {
        this.makeState();
        this.createCircle();
    };
    H5lock.prototype.bindEvent = function () {
        var self = this;
        this.canvas.addEventListener("touchstart", function (e) {

            console.log("touchstart");

            e.preventDefault();// 某些android 的 touchmove不宜触发 所以增加此行代码
            var po = self.getPosition(e);
            console.log(po);
            for (var i = 0; i < self.arr.length; i++) {
                if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {

                    // 如果刚开始触摸的点是在圆点中的时候,说明是正常的开始解锁
                    self.touchFlag = true;
                    self.drawPoint(self.arr[i].x, self.arr[i].y);
                    self.lastPoint.push(self.arr[i]);
                    self.restPoint.splice(i, 1);
                    break;
                }
            }
        }, false);
        this.canvas.addEventListener("touchmove", function (e) {

            console.log("touchmove");

            if (self.touchFlag) {
                self.update(self.getPosition(e));
            }
        }, false);
        this.canvas.addEventListener("touchend", function (e) {

            console.log("touchend");

            if (self.touchFlag) {
                self.touchFlag = false;
                self.storePass(self.lastPoint);
                setTimeout(function () {

                    self.reset();
                }, 300);
            }
        }, false);
        document.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);
        document.getElementById('updatePassword').addEventListener('click', function () {
            self.updatePassword();
        });
    }
})();
