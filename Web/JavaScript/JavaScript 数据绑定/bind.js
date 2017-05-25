/* 数据劫持达到数据绑定 */
(function( window ,undefind) {
	var bind = function(opt){
		var el = document.querySelector(opt.el);
		var data = opt.data || {};
        
        if(!el) { console.error('未查找到' + opt.el + '！'); return ;}
        
		return bind.prototype.init(el,data);
	};
    
    bind.prototype = {
        constructor: bind,
        length: 0,
        splice: [].splice,
        
        init: function(el,data) {
            this.el = el;
            this.data = data;
            
            /* 返回所有含有''wx-*''属性的元素 [array] */
            this.elems = this.bindNodesArr(el);
            
            this.bindText();
            this.bindModel();
            
            return this;
        },
        
        /* 返回所有含有''wx-*''属性的元素 [array] */
        bindNodesArr: function(el) {
            var arr = [],
                childs = el.childNodes,
                len = childs.length,
                i,j,
                attr,
                lenAttr;
            
            if(len) {
                for(i = 0; i < len; i++) {
                    el = childs[i];
                    
                    if(el.nodeType === 1) {
                        for(j = 0, lenAttr = el.attributes.length; j < lenAttr; j++ ) {
                            attr = el.attributes[j];
                            if(attr.nodeName.indexOf('wx-') >= 0) {
                                arr.push(el);
                                break;
                            }
                        }
                        /* 拼接子节点含有''wx-*''属性的元素 */
                        arr = arr.concat(this.bindNodesArr(el));
                    }
                }
            }
            return arr;
        },
        
        /* 前端数据劫持 */
        defineObj: function(obj, prop, value) {
            var _value = value || '',
                _this = this;
            
            try {
                Object.defineProperty(obj, prop, {
                    get: function() {
                        return _value;
                    },
                    set: function(newVal) {
                        _value = newVal;
                        _this.bindText();
                        _this.bindModel();
                    },
                    enumerable: true,
                    configurable: true
                });
            }catch (error) {
                
                /* IE8以上才支持defineProperty属性，所以vue不支持IE8及以下 */
                console.log('Borwser must be IE8+!');
            }
        },
        
        bindModel: function() {
            var modelDOMs = this.el.querySelectorAll('[wx-model]'),
                lenModel = modelDOMs.length;
            
            var _this = this,
                i,
                propModel;//wx-model属性值
            
            for(i = 0; i < lenModel; i++) {
                propModel = modelDOMs[i].getAttribute('wx-model');
                
                // model值为空时 赋为空的字符串
                modelDOMs[i].value = this.data[propModel] || '';
                
                // 前端数据劫持
                this.defineObj(this.data, propModel);
                if(document.addEventListener) {
                    // 监听事件不能是keydown， keydown事件发生时，value值还未变化
                    modelDOMs[i].addEventListener('keyup', function(e) {
                        e = e || window.event;
                        _this.data[propModel] = e.target.value;
                    },false);
                }
            }
        },
        
        bindText: function() {
            var textDOMs = this.el.querySelectorAll('[wx-text]'),
                lenText = textDOMs.length,
                propText,
                j;
            
            for(j = 0; j < lenText; j++){
                propText = textDOMs[j].getAttribute('wx-text');
                
                textDOMs[j].innerHTML = this.data[propText] || '';
            }
        }
    };
    
    bind.prototype.init.prototype = bind.prototype;
    window.WX = bind;
}) ( window )