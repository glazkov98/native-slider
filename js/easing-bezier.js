/* Source https://github.com/gre/bezier-easing */

class BezierEasing {
	constructor(mX1, mY1, mX2, mY2) {
		this.mX1 = mX1;
		this.mY1 = mY1;
		this.mX2 = mX2;
		this.mY2 = mY2;
		this.NEWTON_ITERATIONS = 4;
		this.NEWTON_MIN_SLOPE = 0.001;
		this.SUBDIVISION_PRECISION = 0.0000001;
		this.SUBDIVISION_MAX_ITERATIONS = 10;
		this.kSplineTableSize = 11;
		this.kSampleStepSize = 1.0 / (this.kSplineTableSize - 1.0);
		this.float32ArraySupported = typeof Float32Array === 'function';

		if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
			console.error('bezier x values must be in [0, 1] range');
		}

		let sampleValues = this.float32ArraySupported ? new Float32Array(this.kSplineTableSize) : new Array(this.kSplineTableSize);
		for (let i = 0; i < this.kSplineTableSize; ++i) {
			sampleValues[i] = this.calcBezier(i * this.kSampleStepSize, mX1, mX2);
		}
		this.sampleValues = sampleValues;
	}

	A(aA1, aA2) {
		return 1.0 - 3.0 * aA2 + 3.0 * aA1;
	}

	B(aA1, aA2) {
		return 3.0 * aA2 - 6.0 * aA1;
	}

	C(aA1) {
		return 3.0 * aA1;
	}

	calcBezier(aT, aA1, aA2) {
		return ((this.A(aA1, aA2) * aT + this.B(aA1, aA2)) * aT + this.C(aA1)) * aT;
	}

	getSlope(aT, aA1, aA2) {
		return 3.0 * this.A(aA1, aA2) * aT * aT + 2.0 * this.B(aA1, aA2) * aT + this.C(aA1);
	}

	binarySubdivide(aX, aA, aB, mX1, mX2) {
		var currentX, currentT, i = 0;
		do {
			currentT = aA + (aB - aA) / 2.0;
			currentX = this.calcBezier(currentT, mX1, mX2) - aX;
			if (currentX > 0.0) {
				aB = currentT;
			} else {
				aA = currentT;
			}
		} while (Math.abs(currentX) > this.SUBDIVISION_PRECISION && ++i < this.SUBDIVISION_MAX_ITERATIONS);
		return currentT;
	}

	newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
		for (var i = 0; i < this.NEWTON_ITERATIONS; ++i) {
			var currentSlope = this.getSlope(aGuessT, mX1, mX2);
			if (currentSlope === 0.0) {
				return aGuessT;
			}
			var currentX = this.calcBezier(aGuessT, mX1, mX2) - aX;
			aGuessT -= currentX / currentSlope;
		}
		return aGuessT;
	}

	linearEasing(x) {
		return x;
	}

	getTForX(aX) {
		let intervalStart = 0.0;
		let currentSample = 1;
		let lastSample = this.kSplineTableSize - 1;

		for (; currentSample !== lastSample && this.sampleValues[currentSample] <= aX; ++currentSample) {
			intervalStart += this.kSampleStepSize;
		}
		--currentSample;

		const dist = (aX - this.sampleValues[currentSample]) / (this.sampleValues[currentSample + 1] - this.sampleValues[currentSample]);
		const guessForT = intervalStart + dist * this.kSampleStepSize;

		const initialSlope = this.getSlope(guessForT, this.mX1, this.mX2);
		if (initialSlope >= this.NEWTON_MIN_SLOPE) {
			return this.newtonRaphsonIterate(aX, guessForT, this.mX1, this.mX2);
		} else if (initialSlope === 0.0) {
			return guessForT;
		} else {
			return this.binarySubdivide(aX, intervalStart, intervalStart + this.kSampleStepSize, this.mX1, this.mX2);
		}
	}

	calc(x) {
		if (this.mX1 === this.mY1 && this.mX2 === this.mY2) {
			return this.linearEasing(x);
		}

		if (x === 0 || x === 1) {
			return x;
		}

		return this.calcBezier(this.getTForX(x), this.mY1, this.mY2);
	}
}