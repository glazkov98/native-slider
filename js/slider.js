class NativeSlider {
	constructor(selector, options = false) {
		this.selector = selector;
		this.class = this.selector.slice(1);
		this.current = 1;
		this.count = 0;
		this.scroll = 0;
		this.startScroll = 0;
		this.easingEffects = {
			'ease': [0.25, 0.1, 0.25, 1],
			'ease-in': [0.42, 0, 1, 1],
			'ease-out': [0, 0, 0.58, 1],
			'ease-in-out': [0.42, 0, 0.58, 1]
		};
		this.default = {
			width: 500,
			height: 300,
			speed: 1000,
			easingEffect: 'ease',
			pagination: true
		}
		if (options) {
			if (options.width) this.default.width = options.width;
			if (options.height) this.default.height = options.height;
			if (options.speed) this.default.speed = options.speed;
			if (options.easingEffect) this.default.easingEffect = options.easingEffect;
			if (options.pagination) this.default.pagination = options.pagination;
		}
	}

	init() {
		if (document.documentElement.clientWidth < 768) {
			this.default.width = this.default.width - 60;
		}

		if (document.documentElement.clientWidth < 540) {
			this.default.width = document.documentElement.clientWidth - 100;
			this.default.height = this.default.height / 2;
		}

		const sliderContainer = document.querySelector(this.selector);
		let sliderImages = sliderContainer.querySelectorAll(`${this.selector} img`);

		const sliderList = sliderContainer.querySelector(`${this.selector}__list`);
		const sliderPagination = sliderContainer.querySelector(`${this.selector}__pagination`);

		const sliderViewport = document.createElement('div');
		sliderViewport.classList.add(`${this.class}__viewport`);
		sliderViewport.style.width = `${this.default.width}px`;
		sliderViewport.style.height = this.default.pagination === true ? `${this.default.height + 30}px` : `${this.default.height}px`;

		let listWidth = 0;
		let imageBox;
		let firstImageBox;
		let lastImageBox;
		let content = '';
		this.count = sliderImages.length;
		sliderImages.forEach((image, i) => {
			imageBox = document.createElement('div');
			imageBox.classList.add(`${this.class}__box`);
			imageBox.style.width = `${this.default.width}px`;
			imageBox.style.height = `${this.default.height}px`;
			image.classList.add(`${this.class}__img`);
			imageBox.append(image);
			if (i == 0) {
				firstImageBox = imageBox.cloneNode(true);
				firstImageBox.classList.add(`${this.class}__box-cloned`);
				imageBox.classList.add('active');
			}
			if (i == sliderImages.length - 1) {
				lastImageBox = imageBox.cloneNode(true);
				lastImageBox.classList.add(`${this.class}__box-cloned`);
			}
			content += imageBox.outerHTML;
		});
		sliderList.innerHTML = lastImageBox.outerHTML + content + firstImageBox.outerHTML;

		sliderImages = sliderList.querySelectorAll('img');
		sliderImages.forEach((image) => {
			listWidth += this.default.width;
		});
		const translate = -this.default.width;
		this.scroll = translate;
		this.startScroll = translate;

		sliderList.style.width = `${listWidth}px`;
		sliderList.style.transform = `translateX(${translate}px)`;

		const prevBtn = sliderContainer.querySelector(`${this.selector}__prev`);
		const nextBtn = sliderContainer.querySelector(`${this.selector}__next`);

		let sliderPaginationContent = '';
		if (this.default.pagination) {
			let sliderPaginationItem;
			for (let i = 0; i < this.count; i++) {
				sliderPaginationItem = document.createElement('span');
				sliderPaginationItem.classList.add(`${this.class}__pagination-item`);
				sliderPaginationItem.setAttribute('data-item', i+1);
				if (i == 0) sliderPaginationItem.classList.add('active');
				sliderPaginationContent += sliderPaginationItem.outerHTML;
			}
			sliderPagination.innerHTML = sliderPaginationContent;
			sliderPagination.querySelectorAll(`${this.selector}__pagination-item`).forEach((item) => {
				item.onclick = () => {
					if (!item.classList.contains('disabled')) this.scrollToItem(+item.getAttribute('data-item'));
				}
			});
		}

		sliderContainer.innerHTML = '';
		sliderViewport.append(sliderList);
		if (this.default.pagination) sliderViewport.append(sliderPagination);
		sliderViewport.prepend(prevBtn);
		sliderViewport.append(nextBtn);
		sliderContainer.append(sliderViewport);

		prevBtn.onclick = (e) => {
			e.preventDefault();
			this.prev();
		}

		nextBtn.onclick = (e) => {
			e.preventDefault();
			this.next();
		}
	}

	prev() {
		const prevItem = this.current - 1;
		this.scrollToItem(prevItem);
	}

	next() {
		const nextItem = this.current + 1;
		this.scrollToItem(nextItem);
	}

	toggle() {
		if (this.current < 1) this.current = this.count;
		else if (this.current > this.count) this.current = 1;

		document.querySelector(`${this.selector}__box.active`).classList.remove('active');
		document.querySelectorAll(`${this.selector}__box`)[this.current].classList.add('active');
		
		if (this.default.pagination) {
			document.querySelector(`${this.selector}__pagination-item.active`).classList.remove('active');
			document.querySelectorAll(`${this.selector}__pagination-item`)[this.current-1].classList.add('active');
			document.querySelectorAll(`${this.selector}__pagination-item`).forEach(item => {
				item.classList.add('disabled');
			});
		}
		
		const prevBtn = document.querySelector(`${this.selector}__prev`);
		const nextBtn = document.querySelector(`${this.selector}__next`);
		prevBtn.setAttribute('disabled', 'disabled');
		nextBtn.setAttribute('disabled', 'disabled');
		
		setTimeout(() => {
			prevBtn.removeAttribute('disabled');
			nextBtn.removeAttribute('disabled');
			if (this.default.pagination) {
				document.querySelectorAll(`${this.selector}__pagination-item`).forEach(item => {
					item.classList.remove('disabled');
				});
			}
		}, this.default.speed);
	}

	scrollToItem(item) {
		this.current = item;
		this.scroll = -(this.default.width * item);
		this.toggle();
		this.animate();
	}

	animate() {
		const sliderList = document.querySelector(`${this.selector}__list`);
		const speed = this.default.speed;
		const startScroll = this.startScroll;
		const count = this.count;
		const defaultWidth = this.default.width;
		const easingEffect = this.default.easingEffect;
		const easingEffects = this.easingEffects;
		let scroll = this.scroll;

		function animate({timing, draw, duration}) {
			let start = performance.now();

			requestAnimationFrame(function animate(time) {
				let timeFraction = (time - start) / duration;
				if (timeFraction > 1) timeFraction = 1;

				let progress = timing(timeFraction);

				draw(progress);

				if (timeFraction < 1) {
					requestAnimationFrame(animate);
				}
			});
		}

		const updateScroll = scroll => {
			this.scroll = scroll;
			this.startScroll = scroll;
		}

		animate({
			duration: speed,
			timing(t) {
				if (easingEffect != 'linear' && easingEffects[easingEffect] != undefined) {
					const bezierEasing = new BezierEasing(...easingEffects[easingEffect]);
					return bezierEasing.calc(t);
				}
				return t;
			},
			draw(progress) {
				if (progress >= 0) {
					if (startScroll != scroll) {
						let expression = startScroll + (progress * -(-scroll - -startScroll));
						sliderList.style.transform = `translateX(${expression}px)`;
					}
				}
				if (progress == 1) {
					if (scroll == -(defaultWidth * count) - defaultWidth) {
						sliderList.style.transform = `translateX(${-defaultWidth}px)`;
						scroll = -defaultWidth;
					} else if (scroll == 0) {
						scroll = -(defaultWidth * count);
						sliderList.style.transform = `translateX(${scroll}px)`;
					}
					updateScroll(scroll);
				}
			}
		});
	}
}

const nativeSlider = new NativeSlider('.native-slider');
nativeSlider.init();