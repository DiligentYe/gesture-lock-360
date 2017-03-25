(function(document) {
  /* 初始化页面元素 */
  /* 获取页面元素 */
  var msg = document.getElementById('msg');
  var setSecret = document.getElementById('setSecret');
  var validSecret = document.getElementById('validSecret');
  var header = document.getElementById('header');

  /* 获取本地存储的密码 */
  var secret = localStorage.getItem('secret');

  /* 如果本地为设置密码，则提示设置密码，并且点选按钮位于设置选项上 */
  if (!secret) {
    msg.innerHTML = '请初始化您的密码';
    setSecret.checked = true;
    validSecret.disabled = true;
  } else {
    msg.innerHTML = '请输入您的密码';
    validSecret.checked = true;
  }

  /*在页面中添加canvas标签， 其宽高等于外部容器宽高 */
  var container = document.getElementById('canvasContainer');
  var myCanvas = document.createElement('canvas');
  myCanvas.id = 'myCanvas';
  var canvasWidth = document.defaultView
    .getComputedStyle(container, null).width;
  /* 设置画布大小 */
  myCanvas.width = parseInt(canvasWidth);
  myCanvas.height = parseInt(canvasWidth);
  /* 设置显示大小 */
  myCanvas.style.width = canvasWidth;
  myCanvas.style.height = canvasWidth;
  container.appendChild(myCanvas);

  /* 计算九个点的位置和半径 */
  var radius = 0;
  var points = [];

  var canvasInfor = computedPoint(myCanvas.width, 0.55);
  radius = canvasInfor.radius;
  points = canvasInfor.points;

  /* 上下文数组，前九个画线，最后一个画线 */
  var contexts = createContext(10, myCanvas);

  /* 初始化页面 */
  draw(contexts, points, radius, linkedPoint, myCanvas);

  /* 点击点向下偏移 */
  var yOffset = header.offsetHeight;

  /* 鼠标在画布中的位置 */
  var xPos, yPos;

  /* 点击到点的数组 */
  var linkedPoint = [];

  /* 临时存放设置的密码 */
  var tempPoint = '';

  /* 监听事件 */
  myCanvas.addEventListener('touchstart', function(event) {
    /* 禁止拖动页面默认行为 */
    event.preventDefault();

    // 获取当前位置
    xPos = event.touches[0].pageX;
    yPos = event.touches[0].pageY - yOffset;
    isInner(xPos, yPos, points, radius, linkedPoint);
    draw(contexts, points, radius, linkedPoint, myCanvas);
  }, false);

  myCanvas.addEventListener('touchmove', function(event) {
    xPos = event.touches[0].pageX;
    yPos = event.touches[0].pageY - yOffset;
    isInner(xPos, yPos, points, radius, linkedPoint)
    draw(contexts, points, radius, linkedPoint, myCanvas);
  }, false);

  myCanvas.addEventListener('touchend', function(event) {
    if (setSecret.checked) {
      if (linkedPoint.length < 4) {
        msg.innerHTML = '您输入的密码长度小于4';
        setTimeout(function() {
          msg.innerHTML = '请重新输入密码';
          resetPage()
        }, 1000);
      } else {
        if (!tempPoint) {
          tempPoint = linkedPoint.toString();
          msg.innerHTML = '请再次输入密码';
          resetPage();
        } else {
          if (tempPoint != linkedPoint.toString()) {
            msg.innerHTML = '两次输入不一致,重新进行设置';
            resetPage();
          } else {
            msg.innerHTML = '设置成功，请选择验证登陆';
            validSecret.checked = false;
            setSecret.checked = false;
            validSecret.disabled = false;
            localStorage.setItem('secret', linkedPoint.toString());
            resetPage();
          }
          tempPoint = '';
        }
      }
    } else if (validSecret.checked) {
      secret = localStorage.getItem('secret');
      if (linkedPoint.toString() == secret) {
        msg.innerHTML = '登陆成功';
        resetPage();
      } else {
        msg.innerHTML = '密码不正确，请重新输入';
        resetPage();
      }
    } else {
      msg.innerHTML = '请选择验证按钮';
      resetPage();
    }
  }, false);

  /**
   * 重新绘制页面
   */
  function resetPage() {
    clear(points, linkedPoint);
    linkedPoint = [];
    draw(contexts, points, radius, linkedPoint, myCanvas);
  }
})(document);

/**
 * 清空选中点
 * @param  {array} points      所有圆信息
 * @param  {array} linkedPoint 存放所有选择点
 */
function clear(points) {
  for (var i = 0, len1 = points.length; i < len1; ++i) {
    points[i].isFull = false;
  }
}
/**
 * 判断触摸点是否在圆内
 * @param  {number}  xPos   	      在画布中的x偏移
 * @param  {number}  yPos          在画布中的y偏移
 * @param  {array}  points  	      所有点信息
 * @param  {array}  linkedPoint    已经经过的点
 * @param  {number}  radius        半径
 */
function isInner(xPos, yPos, points, radius, linkedPoint) {
  /* 是否已经经过 */
  var isValid = true;
  for (var i = 0, len1 = points.length; i < len1; ++i) {
    var x = points[i].x;
    var y = points[i].y;

    /* 判断是否在某个圆范围内，并且判断是否已经加入已有点数组中 */
    if (isValid && xPos > x - radius && xPos < x + radius &&
      yPos > y - radius && yPos < y + radius) {
      for (var j = 0, len2 = linkedPoint.length; j < len2; ++j) {
        if (linkedPoint[j] == i) {
          isValid = false;
          break;
        }
      }
      /* 加入后，跳出*/
      if (isValid) {
        points[i].isFull = true;
        linkedPoint.push(i);
        isValid = false;
        break;
      }

    }
  }
}

/**
 * 画到页面上
 * @param  {array} contexts     上下文数组
 * @param  {array} points       每个圆的信息
 * @param  {number} radius      半径
 * @param  {array}  linkedPoint 已经经过的点
 */
function draw(contexts, points, radius, linkedPoint) {
  /*清空画布*/
  contexts[0].clearRect(0, 0, 800, 800);
  for (var i = 0; i < contexts.length - 1; ++i) {
    drawCircle(points[i], radius, contexts[i]);
  }
  if (linkedPoint) {
    drawLine(linkedPoint, points, contexts[9]);
  }
}

/**
 * 画圆（空心或者实心）	
 * @param  {object}  point   每个点的具体信息
 * @param  {Number}  radius  半径
 * @param  {Object}  context 所在上下文
 */
function drawCircle(point, radius, context) {
  context.beginPath();
  context.arc(point.x, point.y, radius, 0, 2 * Math.PI, false);

  if (point.isFull) {
    context.fill();
  } else {
    /* 先清理，在画图，需要考虑边框宽度 */
    /*context.clearRect(point.x - radius - 2,
      point.y - radius - 2, 2 * radius + 4, 2 * radius + 4);*/
    context.stroke();
  }

}

/**
 * 绘制链接线
 * @param  {array}   linkedPoint 存放所有选择点
 * @param  {array}   points      所有圆信息
 * @param  {object}  lineContext 绘制线上下文
 */
function drawLine(linkedPoint, points, lineContext) {
  var index;
  lineContext.beginPath();
  if (linkedPoint.length != 0) {
    index = linkedPoint[0];
    lineContext.moveTo(points[index].x, points[index].y);
    for (var i = 1, len = linkedPoint.length; i < len; ++i) {
      index = linkedPoint[i];
      lineContext.lineTo(points[index].x, points[index].y);
      lineContext.moveTo(points[index].x, points[index].y);
    }
  }
  lineContext.stroke();
}

/**
 * 计算出九个圆的圆心，及半径
 * @param  {number} canvasWidth 画布的大小
 * @param  {number} scale       按钮占据的面积
 * @return {object}             计算出的九个圆心点，及半径
 */
function computedPoint(canvasWidth, scale) {
  /* 半径 */
  var radius = Math.floor(canvasWidth * scale / 3 / 2);
  /* 每个按钮间的间隙 */
  var gap = Math.floor((canvasWidth - radius * 6) / 4);
  /* 总体偏移 */
  var offset = Math.floor((canvasWidth - radius * 6 - gap * 4) / 2);

  /* 每个圆的布局编号为
  	0	1	2
  	3	4	5
  	6	7	8
  	以第一个点为起点，之后的每一个点的
  	x坐标都是第一个点坐标 ＋ 当前索引 ％ 3 ＊（gap+2*radius）
  	y坐标都是第一个点坐标 ＋ 当前索引 / 3 ＊（gap+2*radius）
  */
  var points = [];
  points[0] = {
    x: offset + gap + radius,
    y: offset + gap + radius,
    /* 标识空心还是实心 */
    isFull: false
  }

  for (var i = 1; i < 9; ++i) {
    points[i] = {
      x: points[0].x + i % 3 * (gap + 2 * radius),
      y: points[0].y + Math.floor(i / 3) * (gap + 2 * radius),
      isFull: false
    }
  }

  return {
    points: points,
    radius: radius
  }
}

/**
 * 创建上下文
 * @param  {number} num      创建的上下文个数
 * @param  {object} myCanvas 上下文对应的画布
 * @return {object}          创建好的上下文
 */
function createContext(num, myCanvas) {
  var contexts = [];
  for (var i = 0; i < num; ++i) {
    contexts[i] = myCanvas.getContext('2d');
    contexts[i].lineWidth = 2;
    contexts[i].strokeStyle = 'rgba(200, 200, 200, 0.6)';
    contexts[i].fillStyle = 'rgba(200, 200, 200, 0.6)';
  }
  return contexts;
}