import VueTypes from 'vue-types';
import { flattenDeep } from 'lodash';
import transform from 'prefix';
import SplitText from '../../vendor/gsap/SplitText'; /* eslint-disable-line */

// @vue/component
export default {
  name: 'TextInfinite',
  props: {
    text: VueTypes.string.def('INFINITE'),
    speed: VueTypes.number.def(1),
    acceleration: VueTypes.number.def(0),
    padding: VueTypes.number.def(3),
    type: VueTypes.string.isRequired,
    repeat: VueTypes.number.def(2),
    split: VueTypes.bool.def(false),
  },
  data() {
    return {
      textWidth: null,
      containerWidth: 0,
      position: 0,
      lastTime: 0,
      time: 0,
      totalItems: 1,
    };
  },
  mounted() {
    this.splitText = [];
    this.splitTextChars = [];
    this.transform = transform('transform');
    this.handleResize();
    this.update();
    this.addEventsListeners();
  },
  destroyed() {
    cancelAnimationFrame(this.requestAnimation);
    this.removeEventsListeners();
  },
  methods: {
    setSplitText() {
      this.$refs.text.forEach(e => {
        this.splitText.push(new SplitText(e, { type: 'chars' }));
      });
      this.splitTextChars = flattenDeep(this.splitText.map(st => st.chars));
    },
    destroySplitText() {
      if (this.splitText.length > 0) {
        this.splitText.forEach(e => {
          e.revert();
        });

        this.splitTextChars = [];
      }
    },
    getTextWidth() {
      return this.$refs.text[0].getBoundingClientRect().width;
    },
    getContainerWidth() {
      return this.$el.clientWidth;
    },
    handleResize() {
      this.destroySplitText();
      this.textWidth = Math.round(this.getTextWidth());
      this.containerWidth = this.getContainerWidth();
      this.totalItems = Math.round(this.containerWidth / this.textWidth) + this.repeat + 1 || 2;
      if (this.split) {
        setTimeout(() => {
          this.setSplitText();
          this.textWidth = Math.round(this.getTextWidth());
          this.containerWidth = this.getContainerWidth();
        }, 0);
      }
    },
    update() {
      this.time = this.time + this.speed + this.acceleration;
      this.animateWrapper();
      this.requestAnimation = requestAnimationFrame(this.update);
    },
    animateWrapper() {
      if (this.position < -this.textWidth * this.repeat + this.speed + this.acceleration) {
        this.lastTime = this.time;
        this.position = 0;
      } else {
        this.position = -(this.time - this.lastTime);
      }

      this.$refs.wrapper.style[this.transform] = `translate3d(${this.position}px,0,0)`;
    },
    addEventsListeners() {
      window.addEventListener('resize', this.handleResize);
    },
    removeEventsListeners() {
      window.removeEventListener('resize', this.handleResize);
    },
  },
};
