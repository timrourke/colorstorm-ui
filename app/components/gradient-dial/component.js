import Ember from 'ember';
import { didAttrUpdate } from 'color-storm/utils/did-attr-update';

const { 
	addListener,
	Component, 
	computed,
	on,
	removeListener,
	run,
	sendEvent
} = Ember;
const { debounce, scheduleOnce } = run;
const { service } = Ember.inject;

/**
 * @param Object pointA   A set of coordinates in {x:Number,y:Number} format
 * @param Object pointB   A set of coordinates in {x:Number,y:Number} format
 *
 * Calculate the linear distance between two points on a plane
 */
function calcLinearDistance(pointA, pointB) {
  var xSet = pointB.x - pointA.x;
  var ySet = pointB.y - pointA.y;
  return Math.sqrt(Math.pow(xSet, 2) + Math.pow(ySet, 2));
}

function sendOnResize() {
	sendEvent(this, 'windowDidResize');
}

export default Component.extend({
  classNames: ['gradient-dial'],
  movesPosition: false,
  scalesWidth: false,
  scalesHeight: false,

  // Dimensional attributes
  x: 0,
  y: 0,
	w: 200,
  h: 200,
  ctrX: 0,
  ctrY: 0,
  _angle: 0,

	windowResize: service('window-resize'),

	centerElementOnWindowResize: on('windowDidResize', function() {
		this.centerDialPosition(this.get('w'), this.get('h'));
	}),

	bindWindowDidResize: on('didInsertElement', function() {
		addListener(this.get('windowResize'), 'windowDidResize', this, sendOnResize);
	}),

	unbindWindowDidResize: on('willDestroyElement', function() {
		removeListener(this.get('windowResize'), 'windowDidResize', this, sendOnResize);
	}),

  /**
   * @property _angle
   *
   * Angle
   */
  angle: computed('_angle', {
    get() {
      return this.get('_angle');
    },
    set(key, value) {
      return value;
    }
  }),

  init() {
    this._super(...arguments);

    let w = this.get('w');
    let h = this.get('h');

    // Set up initial state and DOM event bindings
    scheduleOnce('afterRender', this, () => {
			this.centerDialPosition(w, h);

      Ember.$('body').on('mouseup', this.unbindEvents);

      // Set the initial dial angle
      let angle = parseInt(this.get('angle'), 10) || 0;
      this.fireManualUpdateAngle(angle);
    });
  },

  /**
   * @param Object attrs
   *
   * Update the dial angle on didUpdateAttrs
   */
  didUpdateAttrs(attrs) { 
    if (didAttrUpdate(attrs, 'angle')) {
      let angle = parseInt(attrs.newAttrs.angle.value, 10);
      debounce(this, 'fireManualUpdateAngle', angle, 100);
    }
  },

  /**
   * Remove event bindings on willDestroyElement
   */
  willDestroyElement() {
    this.unbindEvents();
  },

  /**
   * @param Object event  Browser event object
   *
   * Change the ellipse's center
   */
  changeEllipseCenter(event) {
    let x = event.clientX;
    let y = event.clientY;
    this.set('x', x);
    this.set('y', y);

    let ellipsecenter = {
      x: x,
      y: y
    };

    this.set('ellipsecenter', ellipsecenter);
    this.updateCenter(ellipsecenter);
  },

  /**
   * @param Object event  Browser event object
   *
   * Change the ellipse's height
   */
  changeEllipseHeight(event) {
    let element = this.$();
    let x = event.clientX;
    let y = event.clientY;
    let ctrX = element[0].offsetLeft + (element[0].clientWidth / 2);
    let ctrY = element[0].offsetTop + (element[0].clientHeight / 2);

    this.set('x', x);
    this.set('y', y);
    this.set('ctrX', element[0].offsetLeft + (element[0].clientWidth / 2));
    this.set('ctrY', element[0].offsetTop + (element[0].clientHeight / 2));
    
    let ellipseheight = calcLinearDistance({x: x, y: y}, {x: ctrX, y: ctrY}) * 2;
    let ellipsecenter = {
      x: ctrX,
      y: ctrY
    };
    
    this.updateHeight(ellipseheight);
    
    this.set('ellipseheight', ellipseheight);
    this.set('ellipsecenter', ellipsecenter);
  },

  /**
   * @param Number angle  Angle
   *
   * Update the ellipse's angle
   */
  fireManualUpdateAngle(angle) {
    this.set('_angle', angle);
    this.updateAngle(angle);
  },

	centerDialPosition(w, h) {
		this.set('x', (parseInt(window.innerWidth) / 2) - (w / 2));
		this.set('y',  (parseInt(window.innerHeight) / 2) - (h / 2));
		this.$().css({
			position: 'absolute',
			top: (parseInt(window.innerHeight) / 2) - (h * 0.75) + 'px',
			left: (parseInt(window.innerWidth) / 2) - (w / 2) + 'px',
			borderRadius: '50%',
			display: 'block',
			width: `${w}px`,
			height: `${h}px`,
		});
	},

  /**
   * @param Object event  Browser event object
   *
   * Change the ellipse's width
   */
  resizeEllipse(event) {
    let element = this.$();
    let x = event.clientX;
    let y = event.clientY;
		let offset = element.offset();
    let ctrX = offset.left + (element.width() / 2);
    let ctrY = offset.top + (element.height() / 2);
    let angle = Math.atan2(-(ctrY - y), -(ctrX - x)) * 180 / Math.PI + 180;

    this.set('x', x);
    this.set('y', y);
    this.set('ctrX', ctrX);
    this.set('ctrY', ctrY);
    
    let ellipsecenter = {
      x: this.get('ctrX'),
      y: this.get('ctrY')
    };

    // Update width if allowed by implementation
    if (this.get('scalesWidth')) {
      let width = calcLinearDistance({x: x, y: y}, {x: ctrX, y: ctrY}) * 2;
      this.set('width', width);
      this.updateWidth(width);
      this.set('ellipsewidth', width);  
    }

    this.updateAngle(angle - 90);
    this.set('_angle', angle - 90);
    this.set('ellipsecenter', ellipsecenter);
  },

  /**
   * Unbind events from DOM on teardown
   */
  unbindEvents() {
    Ember.$('body').off('mousemove.gradient-dial');
    Ember.$('body').off('mousemove.gradient-dial');
    Ember.$('body').off('mousemove.gradient-dial');
    Ember.$('body').off('mouseup.gradient-dial');
    Ember.$('body').css('cursor', '');
  },

  /**
   * @param Number angle  Angle
   *
   * Update the ellipse's `rotateZ` css style
   */
  updateAngle(angle) {        
    let element = this.$('.gradient-dial__handle--size');

    run(() => {
      element.css({
        transform: `
					translateX(-50%)
					rotateZ(${angle}deg)
				`
      });
    });
  },

  /**
   * @param Number height  Height
   *
   * Update the ellipse's position
   */
  updateCenter(newCenter) {
    let element = this.$();
    element.css({
      top: newCenter.y - (element[0].clientHeight / 2) + 'px',
      left: newCenter.x - (element[0].clientWidth / 2) + 'px'
    });
  },

  /**
   * @param Number height  Height
   *
   * Update the ellipse's height, taking its center position into account
   */
  updateHeight(height) {
    let element = this.$();
    let ctrY = this.get('ctrY');

    run(() => {
      element.css({
        top: element[0].offsetTop + element[0].clientTop + ((ctrY - element[0].offsetTop)) - (height/2) + 'px',
        height: height + 'px'
      });
    });
  },

  /**
   * @param Number width  Width
   *
   * Update the ellipse's width, taking its center position into account
   */
  updateWidth(width) {
    let element = this.$();
    let ctrX = this.get('ctrX');

    run(() => {
      element.css({
        top: element[0].offsetTop + 'px',
        left: element[0].offsetLeft + element[0].clientLeft + ((ctrX - element[0].offsetLeft)) - (width/2) + 'px', 
        width: width + 'px'
      });
    });
  },

  actions: {
    /**
     * Begin listening for drag events to change ellipse's center position
     */
    changeEllipseCenter() {
      Ember.$('body').on('mousemove.gradient-dial', (e) => {
        run(() => this.changeEllipseCenter(e));
      });
      Ember.$('body').attr('style', 
        'cursor: -webkit-grabbing; cursor: grabbing;');
    },

    /**
     * Begin listening for drag events to change ellipse's height
     */
    changeEllipseHeight() {
      Ember.$('body').on('mousemove.gradient-dial', (e) => {
        run(() => this.changeEllipseHeight(e));
      });
      Ember.$('body').attr('style', 
        'cursor: -webkit-grabbing; cursor: grabbing;');
    },

    /**
     * Begin listening for drag events to change ellipse's width
     */
    resizeEllipse() {
      Ember.$('body').on('mousemove.gradient-dial', (e) => {
        run(() => this.resizeEllipse(e));
      });
      Ember.$('body').attr('style', 
        'cursor: -webkit-grabbing; cursor: grabbing;');
    },
  }
});
