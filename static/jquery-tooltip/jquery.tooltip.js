function Tooltip(options) {

    // Define options default
    var settings = {
        elem: null,                 // selector
        layout: null,               // set string of html or function
        position: 'bottom',         // top, bottom, left, right
        mode: 'hover',              // hover or click
        margin: 10,                 // set margin tooltip from elem
        animation: false,           // set false or fall, grow, swing, slide, fade
        animationDuration: 350
    };

    // Create global element references
    this.$activeElem = null;
    this.$activeTooltip = null;
    this.$window = $(window);
    this.$body = $('body');

    var _self = this;

    var timerId;      // for Animation before append

    // Private methods

    this._setLayout = function () {

        if (typeof settings.layout === 'function') {
            return settings.layout(settings.elem);
        } else {
            return settings.layout;
        }

    };

    this._create = function (event, elem) {

        if (!settings.layout) {
            return;
        }

        if (this.$activeElem) {
            this.$activeTooltip.on('mouseleave touchend', function () {
                _self.destroy();
            });
            if(this.$activeTooltip.is(':hover')) {
                return;
            }
            this.destroy();
        }

        if (event.type === 'mouseleave' || event.type === 'touchend') {
            return;
        }

        this.$activeElem = elem;
        this.$activeTooltip = $(this._setLayout());

        this.$body.append(this.$activeTooltip);

        if (settings.animation) {
            this._animate();
        }

        this._setPosition();

    };

    this._setPosition = function () {

        if (!this.$activeElem) {
            return;
        }

        var
                top,
                left,
                topA,
                leftA,
                margin = settings.margin,
                tooltipHeight = this.$activeTooltip.outerHeight(),
                tooltipHalf = (this.$activeTooltip.outerWidth() / 2),
                elemHeight = this.$activeElem.outerHeight(),
                elemHalf = (this.$activeElem.outerWidth() / 2),
                elemOffset = this.$activeElem.offset(),
                $arrow = $('.arrow', this.$activeTooltip),
                arrowHeight = $arrow.outerHeight(),
                arrowWidth = $arrow.outerWidth();

        top = elemOffset.top + elemHeight + margin;
        left = elemOffset.left + elemHalf - tooltipHalf;

        topA = -arrowHeight;
        leftA = tooltipHalf - ($arrow.outerWidth() / 2);

        if (settings.position === 'top') {

            top = elemOffset.top - tooltipHeight - margin;
            topA = tooltipHeight;
            $arrow.css({transform : 'rotate(180deg)'});

        }  else if (settings.position === 'left') {

            left = elemOffset.left - tooltipHalf * 2 - margin;
            top = elemOffset.top + elemHeight / 2 - tooltipHeight / 2;
            topA = tooltipHeight / 2 - arrowHeight / 2;
            leftA = this.$activeTooltip.outerWidth() - 2;
            $arrow.css({transform : 'rotate(90deg)'});

            if (elemOffset.left - tooltipHalf * 2 < 0) {

                left = elemOffset.left + elemHalf - tooltipHalf;
                top = elemOffset.top + elemHeight + margin;
                topA = -arrowHeight;
                leftA = tooltipHalf - ($arrow.outerWidth() / 2);
                $arrow.css({transform : 'rotate(0deg)'});
            }

        } else if (settings.position === 'right') {

            left = elemOffset.left + elemHalf * 2 + margin;
            top = elemOffset.top + elemHeight / 2 - tooltipHeight / 2;
            topA = tooltipHeight / 2 - arrowHeight / 2;
            leftA = -arrowWidth + 2;
            $arrow.css({transform : 'rotate(-90deg)'});

            if (((this.$body.outerWidth() - (elemOffset.left + elemHalf * 2)) - tooltipHalf * 2) < 0) {

                left = elemOffset.left + elemHalf - tooltipHalf;
                top = elemOffset.top + elemHeight + margin;
                topA = -arrowHeight;
                leftA = tooltipHalf - ($arrow.outerWidth() / 2);
                $arrow.css({transform : 'rotate(0deg)'});
            }
        }

        this.$activeTooltip.css({
            top: top,
            left: left
        });

        if ($('.arrow', this.$activeTooltip)) {
            $arrow.css({
                top: topA,
                left: leftA
            });
        }

    };

    this._hover = function () {
        settings.elem.on('mouseenter touchstart mouseleave', function (e) {
            _self._create(e, $(this));
        });
    };

    this._click = function () {

        settings.elem.on('click', function (e) {
            e.preventDefault();
            _self._create(e, $(this));
        });

        this.$body.on('click', '.js-close', function (e) {
            _self.destroy();
            e.preventDefault();
        });

        this.$window.on('click', function (e) {
            if ($(e.target).closest(settings.elem).length || $(e.target).closest(_self.$activeTooltip).length) {
                return;
            }
            _self.destroy();
        });

    };

    this._animate = function () {

        clearTimeout(timerId);

        this._setAnimationDirection();

        this.$activeTooltip
                .addClass('tooltip-' + settings.animation)
                .addClass('tooltip-initial')
                .css({
                    '-moz-animation-duration': settings.animationDuration + 'ms',
                    '-ms-animation-duration': settings.animationDuration + 'ms',
                    '-o-animation-duration': settings.animationDuration + 'ms',
                    '-webkit-animation-duration': settings.animationDuration + 'ms',
                    'animation-duration': settings.animationDuration + 'ms',
                    'transition-duration': settings.animationDuration + 'ms'
                });

        timerId = setTimeout(function() {

            _self.$activeTooltip
                    .addClass('tooltip-show')
                    .removeClass('tooltip-initial');

            if (settings.animationDuration > 0) {
                _self.$activeTooltip.delay(settings.animationDuration);
            }

        }, 0);
    };

    this._setAnimationDirection = function () {

        if (settings.animation === 'fall') {
            this.$activeTooltip.css({
                top: this.$activeElem.offset().top - this.$activeTooltip.outerHeight() - 60
            });
        } else if (settings.animation === 'slide') {
            if (settings.position === 'right') {
                this.$activeTooltip.css({
                    left: this.$activeElem.offset().left + this.$activeElem.outerWidth() + 60
                });
            } else if ( settings.position === 'left') {
                this.$activeTooltip.css({
                    left: this.$activeElem.offset().left - this.$activeElem.outerWidth() - 60
                });
            }
        }

    };


    // Public methods

    this.init = function () {

        settings = $.extend(settings, options);

        if (!settings.elem) {
            console.log("Selector isn't defined");
            return;
        }
        if (settings.mode === 'click') {
            this._click();
        } else {
            this._hover();
        }

    };

    this.destroy = function () {

        if (settings.animation) {
            this.removeAnimation();
        } else {
            this.$activeTooltip.remove();
        }

        this.$activeElem = null;
        this.$activeTooltip = null;

    };

    this.removeAnimation = function () {

        if (this.$activeTooltip) {

            this.$activeTooltip
                    .removeClass('tooltip-show')
                    .addClass('tooltip-dying')
                    .delay(settings.animationDuration).queue(function () {
                $(this).remove();
            });

            clearTimeout(timerId);
        }

    };


    // Keep tooltip position after window resize
    this.$window.on('resize orientationchange', function() {
        _self._setPosition();
    });
}

$(function () {

    $.fn.tooltip = function(param) {

        return this.each(function() {
            if (!$.data(this, 'tooltip')) {

                param.elem = $(this);

                var $tooltip = new Tooltip(param);

                $.data(this, 'tooltip', $tooltip);

                $tooltip.init();
            }
        });
    };

});