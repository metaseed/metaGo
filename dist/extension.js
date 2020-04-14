module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/extension.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/semver/classes/comparator.js":
/*!***************************************************!*\
  !*** ./node_modules/semver/classes/comparator.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const ANY = Symbol('SemVer ANY')
// hoisted class for cyclic dependency
class Comparator {
  static get ANY () {
    return ANY
  }
  constructor (comp, options) {
    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      }
    }

    if (comp instanceof Comparator) {
      if (comp.loose === !!options.loose) {
        return comp
      } else {
        comp = comp.value
      }
    }

    debug('comparator', comp, options)
    this.options = options
    this.loose = !!options.loose
    this.parse(comp)

    if (this.semver === ANY) {
      this.value = ''
    } else {
      this.value = this.operator + this.semver.version
    }

    debug('comp', this)
  }

  parse (comp) {
    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
    const m = comp.match(r)

    if (!m) {
      throw new TypeError(`Invalid comparator: ${comp}`)
    }

    this.operator = m[1] !== undefined ? m[1] : ''
    if (this.operator === '=') {
      this.operator = ''
    }

    // if it literally is just '>' or '' then allow anything.
    if (!m[2]) {
      this.semver = ANY
    } else {
      this.semver = new SemVer(m[2], this.options.loose)
    }
  }

  toString () {
    return this.value
  }

  test (version) {
    debug('Comparator.test', version, this.options.loose)

    if (this.semver === ANY || version === ANY) {
      return true
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options)
      } catch (er) {
        return false
      }
    }

    return cmp(version, this.operator, this.semver, this.options)
  }

  intersects (comp, options) {
    if (!(comp instanceof Comparator)) {
      throw new TypeError('a Comparator is required')
    }

    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      }
    }

    if (this.operator === '') {
      if (this.value === '') {
        return true
      }
      return new Range(comp.value, options).test(this.value)
    } else if (comp.operator === '') {
      if (comp.value === '') {
        return true
      }
      return new Range(this.value, options).test(comp.semver)
    }

    const sameDirectionIncreasing =
      (this.operator === '>=' || this.operator === '>') &&
      (comp.operator === '>=' || comp.operator === '>')
    const sameDirectionDecreasing =
      (this.operator === '<=' || this.operator === '<') &&
      (comp.operator === '<=' || comp.operator === '<')
    const sameSemVer = this.semver.version === comp.semver.version
    const differentDirectionsInclusive =
      (this.operator === '>=' || this.operator === '<=') &&
      (comp.operator === '>=' || comp.operator === '<=')
    const oppositeDirectionsLessThan =
      cmp(this.semver, '<', comp.semver, options) &&
      (this.operator === '>=' || this.operator === '>') &&
        (comp.operator === '<=' || comp.operator === '<')
    const oppositeDirectionsGreaterThan =
      cmp(this.semver, '>', comp.semver, options) &&
      (this.operator === '<=' || this.operator === '<') &&
        (comp.operator === '>=' || comp.operator === '>')

    return (
      sameDirectionIncreasing ||
      sameDirectionDecreasing ||
      (sameSemVer && differentDirectionsInclusive) ||
      oppositeDirectionsLessThan ||
      oppositeDirectionsGreaterThan
    )
  }
}

module.exports = Comparator

const {re, t} = __webpack_require__(/*! ../internal/re */ "./node_modules/semver/internal/re.js")
const cmp = __webpack_require__(/*! ../functions/cmp */ "./node_modules/semver/functions/cmp.js")
const debug = __webpack_require__(/*! ../internal/debug */ "./node_modules/semver/internal/debug.js")
const SemVer = __webpack_require__(/*! ./semver */ "./node_modules/semver/classes/semver.js")
const Range = __webpack_require__(/*! ./range */ "./node_modules/semver/classes/range.js")


/***/ }),

/***/ "./node_modules/semver/classes/range.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/classes/range.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// hoisted class for cyclic dependency
class Range {
  constructor (range, options) {
    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      }
    }

    if (range instanceof Range) {
      if (
        range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease
      ) {
        return range
      } else {
        return new Range(range.raw, options)
      }
    }

    if (range instanceof Comparator) {
      // just put it in the set and return
      this.raw = range.value
      this.set = [[range]]
      this.format()
      return this
    }

    this.options = options
    this.loose = !!options.loose
    this.includePrerelease = !!options.includePrerelease

    // First, split based on boolean or ||
    this.raw = range
    this.set = range
      .split(/\s*\|\|\s*/)
      // map the range to a 2d array of comparators
      .map(range => this.parseRange(range.trim()))
      // throw out any comparator lists that are empty
      // this generally means that it was not a valid range, which is allowed
      // in loose mode, but will still throw if the WHOLE range is invalid.
      .filter(c => c.length)

    if (!this.set.length) {
      throw new TypeError(`Invalid SemVer Range: ${range}`)
    }

    this.format()
  }

  format () {
    this.range = this.set
      .map((comps) => {
        return comps.join(' ').trim()
      })
      .join('||')
      .trim()
    return this.range
  }

  toString () {
    return this.range
  }

  parseRange (range) {
    const loose = this.options.loose
    range = range.trim()
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE]
    range = range.replace(hr, hyphenReplace)
    debug('hyphen replace', range)
    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace)
    debug('comparator trim', range, re[t.COMPARATORTRIM])

    // `~ 1.2.3` => `~1.2.3`
    range = range.replace(re[t.TILDETRIM], tildeTrimReplace)

    // `^ 1.2.3` => `^1.2.3`
    range = range.replace(re[t.CARETTRIM], caretTrimReplace)

    // normalize spaces
    range = range.split(/\s+/).join(' ')

    // At this point, the range is completely trimmed and
    // ready to be split into comparators.

    const compRe = loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
    return range
      .split(' ')
      .map(comp => parseComparator(comp, this.options))
      .join(' ')
      .split(/\s+/)
      // in loose mode, throw out any that are not valid comparators
      .filter(this.options.loose ? comp => !!comp.match(compRe) : () => true)
      .map(comp => new Comparator(comp, this.options))
  }

  intersects (range, options) {
    if (!(range instanceof Range)) {
      throw new TypeError('a Range is required')
    }

    return this.set.some((thisComparators) => {
      return (
        isSatisfiable(thisComparators, options) &&
        range.set.some((rangeComparators) => {
          return (
            isSatisfiable(rangeComparators, options) &&
            thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options)
              })
            })
          )
        })
      )
    })
  }

  // if ANY of the sets match ALL of its comparators, then pass
  test (version) {
    if (!version) {
      return false
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options)
      } catch (er) {
        return false
      }
    }

    for (let i = 0; i < this.set.length; i++) {
      if (testSet(this.set[i], version, this.options)) {
        return true
      }
    }
    return false
  }
}
module.exports = Range

const Comparator = __webpack_require__(/*! ./comparator */ "./node_modules/semver/classes/comparator.js")
const debug = __webpack_require__(/*! ../internal/debug */ "./node_modules/semver/internal/debug.js")
const SemVer = __webpack_require__(/*! ./semver */ "./node_modules/semver/classes/semver.js")
const {
  re,
  t,
  comparatorTrimReplace,
  tildeTrimReplace,
  caretTrimReplace
} = __webpack_require__(/*! ../internal/re */ "./node_modules/semver/internal/re.js")

// take a set of comparators and determine whether there
// exists a version which can satisfy it
const isSatisfiable = (comparators, options) => {
  let result = true
  const remainingComparators = comparators.slice()
  let testComparator = remainingComparators.pop()

  while (result && remainingComparators.length) {
    result = remainingComparators.every((otherComparator) => {
      return testComparator.intersects(otherComparator, options)
    })

    testComparator = remainingComparators.pop()
  }

  return result
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
const parseComparator = (comp, options) => {
  debug('comp', comp, options)
  comp = replaceCarets(comp, options)
  debug('caret', comp)
  comp = replaceTildes(comp, options)
  debug('tildes', comp)
  comp = replaceXRanges(comp, options)
  debug('xrange', comp)
  comp = replaceStars(comp, options)
  debug('stars', comp)
  return comp
}

const isX = id => !id || id.toLowerCase() === 'x' || id === '*'

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
const replaceTildes = (comp, options) =>
  comp.trim().split(/\s+/).map((comp) => {
    return replaceTilde(comp, options)
  }).join(' ')

const replaceTilde = (comp, options) => {
  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE]
  return comp.replace(r, (_, M, m, p, pr) => {
    debug('tilde', comp, _, M, m, p, pr)
    let ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = `>=${M}.0.0 <${+M + 1}.0.0`
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0
      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0`
    } else if (pr) {
      debug('replaceTilde pr', pr)
      ret = `>=${M}.${m}.${p}-${pr
      } <${M}.${+m + 1}.0`
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = `>=${M}.${m}.${p
      } <${M}.${+m + 1}.0`
    }

    debug('tilde return', ret)
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
const replaceCarets = (comp, options) =>
  comp.trim().split(/\s+/).map((comp) => {
    return replaceCaret(comp, options)
  }).join(' ')

const replaceCaret = (comp, options) => {
  debug('caret', comp, options)
  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET]
  const z = options.includePrerelease ? '-0' : ''
  return comp.replace(r, (_, M, m, p, pr) => {
    debug('caret', comp, _, M, m, p, pr)
    let ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0${z}`
    } else if (isX(p)) {
      if (M === '0') {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0${z}`
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0${z}`
      }
    } else if (pr) {
      debug('replaceCaret pr', pr)
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${m}.${+p + 1}${z}`
        } else {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${+m + 1}.0${z}`
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr
        } <${+M + 1}.0.0${z}`
      }
    } else {
      debug('no pr')
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${m}.${+p + 1}${z}`
        } else {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${+m + 1}.0${z}`
        }
      } else {
        ret = `>=${M}.${m}.${p
        } <${+M + 1}.0.0${z}`
      }
    }

    debug('caret return', ret)
    return ret
  })
}

const replaceXRanges = (comp, options) => {
  debug('replaceXRanges', comp, options)
  return comp.split(/\s+/).map((comp) => {
    return replaceXRange(comp, options)
  }).join(' ')
}

const replaceXRange = (comp, options) => {
  comp = comp.trim()
  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE]
  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
    debug('xRange', comp, ret, gtlt, M, m, p, pr)
    const xM = isX(M)
    const xm = xM || isX(m)
    const xp = xm || isX(p)
    const anyX = xp

    if (gtlt === '=' && anyX) {
      gtlt = ''
    }

    // if we're including prereleases in the match, then we need
    // to fix this to -0, the lowest possible prerelease value
    pr = options.includePrerelease ? '-0' : ''

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0-0'
      } else {
        // nothing is forbidden
        ret = '*'
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0
      }
      p = 0

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        gtlt = '>='
        if (xm) {
          M = +M + 1
          m = 0
          p = 0
        } else {
          m = +m + 1
          p = 0
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<'
        if (xm) {
          M = +M + 1
        } else {
          m = +m + 1
        }
      }

      ret = `${gtlt + M}.${m}.${p}${pr}`
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0${pr}`
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr
      } <${M}.${+m + 1}.0${pr}`
    }

    debug('xRange return', ret)

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
const replaceStars = (comp, options) => {
  debug('replaceStars', comp, options)
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[t.STAR], '')
}

// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
const hyphenReplace = ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) => {
  if (isX(fM)) {
    from = ''
  } else if (isX(fm)) {
    from = `>=${fM}.0.0`
  } else if (isX(fp)) {
    from = `>=${fM}.${fm}.0`
  } else {
    from = `>=${from}`
  }

  if (isX(tM)) {
    to = ''
  } else if (isX(tm)) {
    to = `<${+tM + 1}.0.0`
  } else if (isX(tp)) {
    to = `<${tM}.${+tm + 1}.0`
  } else if (tpr) {
    to = `<=${tM}.${tm}.${tp}-${tpr}`
  } else {
    to = `<=${to}`
  }

  return (`${from} ${to}`).trim()
}

const testSet = (set, version, options) => {
  for (let i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (let i = 0; i < set.length; i++) {
      debug(set[i].semver)
      if (set[i].semver === Comparator.ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        const allowed = set[i].semver
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}


/***/ }),

/***/ "./node_modules/semver/classes/semver.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/classes/semver.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const debug = __webpack_require__(/*! ../internal/debug */ "./node_modules/semver/internal/debug.js")
const { MAX_LENGTH, MAX_SAFE_INTEGER } = __webpack_require__(/*! ../internal/constants */ "./node_modules/semver/internal/constants.js")
const { re, t } = __webpack_require__(/*! ../internal/re */ "./node_modules/semver/internal/re.js")

const { compareIdentifiers } = __webpack_require__(/*! ../internal/identifiers */ "./node_modules/semver/internal/identifiers.js")
class SemVer {
  constructor (version, options) {
    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      }
    }
    if (version instanceof SemVer) {
      if (version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      )
    }

    debug('SemVer', version, options)
    this.options = options
    this.loose = !!options.loose
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease

    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version

    // these are actually numbers
    this.major = +m[1]
    this.minor = +m[2]
    this.patch = +m[3]

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = []
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      })
    }

    this.build = m[5] ? m[5].split('.') : []
    this.format()
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug('SemVer.compare', this.version, this.options, other)
    if (!(other instanceof SemVer)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer(other, this.options)
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    return (
      compareIdentifiers(this.major, other.major) ||
      compareIdentifiers(this.minor, other.minor) ||
      compareIdentifiers(this.patch, other.patch)
    )
  }

  comparePre (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0
    do {
      const a = this.prerelease[i]
      const b = other.prerelease[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    let i = 0
    do {
      const a = this.build[i]
      const b = other.build[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor = 0
        this.major++
        this.inc('pre', identifier)
        break
      case 'preminor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor++
        this.inc('pre', identifier)
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0
        this.inc('patch', identifier)
        this.inc('pre', identifier)
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier)
        }
        this.inc('pre', identifier)
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++
        }
        this.minor = 0
        this.patch = 0
        this.prerelease = []
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++
        }
        this.patch = 0
        this.prerelease = []
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++
        }
        this.prerelease = []
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre':
        if (this.prerelease.length === 0) {
          this.prerelease = [0]
        } else {
          let i = this.prerelease.length
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++
              i = -2
            }
          }
          if (i === -1) {
            // didn't increment anything
            this.prerelease.push(0)
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          if (this.prerelease[0] === identifier) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = [identifier, 0]
            }
          } else {
            this.prerelease = [identifier, 0]
          }
        }
        break

      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.format()
    this.raw = this.version
    return this
  }
}

module.exports = SemVer


/***/ }),

/***/ "./node_modules/semver/functions/clean.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/clean.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(/*! ./parse */ "./node_modules/semver/functions/parse.js")
const clean = (version, options) => {
  const s = parse(version.trim().replace(/^[=v]+/, ''), options)
  return s ? s.version : null
}
module.exports = clean


/***/ }),

/***/ "./node_modules/semver/functions/cmp.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/cmp.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const eq = __webpack_require__(/*! ./eq */ "./node_modules/semver/functions/eq.js")
const neq = __webpack_require__(/*! ./neq */ "./node_modules/semver/functions/neq.js")
const gt = __webpack_require__(/*! ./gt */ "./node_modules/semver/functions/gt.js")
const gte = __webpack_require__(/*! ./gte */ "./node_modules/semver/functions/gte.js")
const lt = __webpack_require__(/*! ./lt */ "./node_modules/semver/functions/lt.js")
const lte = __webpack_require__(/*! ./lte */ "./node_modules/semver/functions/lte.js")

const cmp = (a, op, b, loose) => {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a === b

    case '!==':
      if (typeof a === 'object')
        a = a.version
      if (typeof b === 'object')
        b = b.version
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError(`Invalid operator: ${op}`)
  }
}
module.exports = cmp


/***/ }),

/***/ "./node_modules/semver/functions/coerce.js":
/*!*************************************************!*\
  !*** ./node_modules/semver/functions/coerce.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const parse = __webpack_require__(/*! ./parse */ "./node_modules/semver/functions/parse.js")
const {re, t} = __webpack_require__(/*! ../internal/re */ "./node_modules/semver/internal/re.js")

const coerce = (version, options) => {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version === 'number') {
    version = String(version)
  }

  if (typeof version !== 'string') {
    return null
  }

  options = options || {}

  let match = null
  if (!options.rtl) {
    match = version.match(re[t.COERCE])
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    let next
    while ((next = re[t.COERCERTL].exec(version)) &&
        (!match || match.index + match[0].length !== version.length)
    ) {
      if (!match ||
            next.index + next[0].length !== match.index + match[0].length) {
        match = next
      }
      re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length
    }
    // leave it in a clean state
    re[t.COERCERTL].lastIndex = -1
  }

  if (match === null)
    return null

  return parse(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
}
module.exports = coerce


/***/ }),

/***/ "./node_modules/semver/functions/compare-build.js":
/*!********************************************************!*\
  !*** ./node_modules/semver/functions/compare-build.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const compareBuild = (a, b, loose) => {
  const versionA = new SemVer(a, loose)
  const versionB = new SemVer(b, loose)
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
}
module.exports = compareBuild


/***/ }),

/***/ "./node_modules/semver/functions/compare-loose.js":
/*!********************************************************!*\
  !*** ./node_modules/semver/functions/compare-loose.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/semver/functions/compare.js")
const compareLoose = (a, b) => compare(a, b, true)
module.exports = compareLoose


/***/ }),

/***/ "./node_modules/semver/functions/compare.js":
/*!**************************************************!*\
  !*** ./node_modules/semver/functions/compare.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const compare = (a, b, loose) =>
  new SemVer(a, loose).compare(new SemVer(b, loose))

module.exports = compare


/***/ }),

/***/ "./node_modules/semver/functions/diff.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/functions/diff.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(/*! ./parse */ "./node_modules/semver/functions/parse.js")
const eq = __webpack_require__(/*! ./eq */ "./node_modules/semver/functions/eq.js")

const diff = (version1, version2) => {
  if (eq(version1, version2)) {
    return null
  } else {
    const v1 = parse(version1)
    const v2 = parse(version2)
    const hasPre = v1.prerelease.length || v2.prerelease.length
    const prefix = hasPre ? 'pre' : ''
    const defaultResult = hasPre ? 'prerelease' : ''
    for (const key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
}
module.exports = diff


/***/ }),

/***/ "./node_modules/semver/functions/eq.js":
/*!*********************************************!*\
  !*** ./node_modules/semver/functions/eq.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/semver/functions/compare.js")
const eq = (a, b, loose) => compare(a, b, loose) === 0
module.exports = eq


/***/ }),

/***/ "./node_modules/semver/functions/gt.js":
/*!*********************************************!*\
  !*** ./node_modules/semver/functions/gt.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/semver/functions/compare.js")
const gt = (a, b, loose) => compare(a, b, loose) > 0
module.exports = gt


/***/ }),

/***/ "./node_modules/semver/functions/gte.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/gte.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/semver/functions/compare.js")
const gte = (a, b, loose) => compare(a, b, loose) >= 0
module.exports = gte


/***/ }),

/***/ "./node_modules/semver/functions/inc.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/inc.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")

const inc = (version, release, options, identifier) => {
  if (typeof (options) === 'string') {
    identifier = options
    options = undefined
  }

  try {
    return new SemVer(version, options).inc(release, identifier).version
  } catch (er) {
    return null
  }
}
module.exports = inc


/***/ }),

/***/ "./node_modules/semver/functions/lt.js":
/*!*********************************************!*\
  !*** ./node_modules/semver/functions/lt.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/semver/functions/compare.js")
const lt = (a, b, loose) => compare(a, b, loose) < 0
module.exports = lt


/***/ }),

/***/ "./node_modules/semver/functions/lte.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/lte.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/semver/functions/compare.js")
const lte = (a, b, loose) => compare(a, b, loose) <= 0
module.exports = lte


/***/ }),

/***/ "./node_modules/semver/functions/major.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/major.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const major = (a, loose) => new SemVer(a, loose).major
module.exports = major


/***/ }),

/***/ "./node_modules/semver/functions/minor.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/minor.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const minor = (a, loose) => new SemVer(a, loose).minor
module.exports = minor


/***/ }),

/***/ "./node_modules/semver/functions/neq.js":
/*!**********************************************!*\
  !*** ./node_modules/semver/functions/neq.js ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/semver/functions/compare.js")
const neq = (a, b, loose) => compare(a, b, loose) !== 0
module.exports = neq


/***/ }),

/***/ "./node_modules/semver/functions/parse.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/parse.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {MAX_LENGTH} = __webpack_require__(/*! ../internal/constants */ "./node_modules/semver/internal/constants.js")
const { re, t } = __webpack_require__(/*! ../internal/re */ "./node_modules/semver/internal/re.js")
const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")

const parse = (version, options) => {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    }
  }

  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  const r = options.loose ? re[t.LOOSE] : re[t.FULL]
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

module.exports = parse


/***/ }),

/***/ "./node_modules/semver/functions/patch.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/patch.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const patch = (a, loose) => new SemVer(a, loose).patch
module.exports = patch


/***/ }),

/***/ "./node_modules/semver/functions/prerelease.js":
/*!*****************************************************!*\
  !*** ./node_modules/semver/functions/prerelease.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(/*! ./parse */ "./node_modules/semver/functions/parse.js")
const prerelease = (version, options) => {
  const parsed = parse(version, options)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}
module.exports = prerelease


/***/ }),

/***/ "./node_modules/semver/functions/rcompare.js":
/*!***************************************************!*\
  !*** ./node_modules/semver/functions/rcompare.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compare = __webpack_require__(/*! ./compare */ "./node_modules/semver/functions/compare.js")
const rcompare = (a, b, loose) => compare(b, a, loose)
module.exports = rcompare


/***/ }),

/***/ "./node_modules/semver/functions/rsort.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/rsort.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compareBuild = __webpack_require__(/*! ./compare-build */ "./node_modules/semver/functions/compare-build.js")
const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose))
module.exports = rsort


/***/ }),

/***/ "./node_modules/semver/functions/satisfies.js":
/*!****************************************************!*\
  !*** ./node_modules/semver/functions/satisfies.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/semver/classes/range.js")
const satisfies = (version, range, options) => {
  try {
    range = new Range(range, options)
  } catch (er) {
    return false
  }
  return range.test(version)
}
module.exports = satisfies


/***/ }),

/***/ "./node_modules/semver/functions/sort.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/functions/sort.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const compareBuild = __webpack_require__(/*! ./compare-build */ "./node_modules/semver/functions/compare-build.js")
const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose))
module.exports = sort


/***/ }),

/***/ "./node_modules/semver/functions/valid.js":
/*!************************************************!*\
  !*** ./node_modules/semver/functions/valid.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const parse = __webpack_require__(/*! ./parse */ "./node_modules/semver/functions/parse.js")
const valid = (version, options) => {
  const v = parse(version, options)
  return v ? v.version : null
}
module.exports = valid


/***/ }),

/***/ "./node_modules/semver/index.js":
/*!**************************************!*\
  !*** ./node_modules/semver/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// just pre-load all the stuff that index.js lazily exports
const internalRe = __webpack_require__(/*! ./internal/re */ "./node_modules/semver/internal/re.js")
module.exports = {
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: __webpack_require__(/*! ./internal/constants */ "./node_modules/semver/internal/constants.js").SEMVER_SPEC_VERSION,
  SemVer: __webpack_require__(/*! ./classes/semver */ "./node_modules/semver/classes/semver.js"),
  compareIdentifiers: __webpack_require__(/*! ./internal/identifiers */ "./node_modules/semver/internal/identifiers.js").compareIdentifiers,
  rcompareIdentifiers: __webpack_require__(/*! ./internal/identifiers */ "./node_modules/semver/internal/identifiers.js").rcompareIdentifiers,
  parse: __webpack_require__(/*! ./functions/parse */ "./node_modules/semver/functions/parse.js"),
  valid: __webpack_require__(/*! ./functions/valid */ "./node_modules/semver/functions/valid.js"),
  clean: __webpack_require__(/*! ./functions/clean */ "./node_modules/semver/functions/clean.js"),
  inc: __webpack_require__(/*! ./functions/inc */ "./node_modules/semver/functions/inc.js"),
  diff: __webpack_require__(/*! ./functions/diff */ "./node_modules/semver/functions/diff.js"),
  major: __webpack_require__(/*! ./functions/major */ "./node_modules/semver/functions/major.js"),
  minor: __webpack_require__(/*! ./functions/minor */ "./node_modules/semver/functions/minor.js"),
  patch: __webpack_require__(/*! ./functions/patch */ "./node_modules/semver/functions/patch.js"),
  prerelease: __webpack_require__(/*! ./functions/prerelease */ "./node_modules/semver/functions/prerelease.js"),
  compare: __webpack_require__(/*! ./functions/compare */ "./node_modules/semver/functions/compare.js"),
  rcompare: __webpack_require__(/*! ./functions/rcompare */ "./node_modules/semver/functions/rcompare.js"),
  compareLoose: __webpack_require__(/*! ./functions/compare-loose */ "./node_modules/semver/functions/compare-loose.js"),
  compareBuild: __webpack_require__(/*! ./functions/compare-build */ "./node_modules/semver/functions/compare-build.js"),
  sort: __webpack_require__(/*! ./functions/sort */ "./node_modules/semver/functions/sort.js"),
  rsort: __webpack_require__(/*! ./functions/rsort */ "./node_modules/semver/functions/rsort.js"),
  gt: __webpack_require__(/*! ./functions/gt */ "./node_modules/semver/functions/gt.js"),
  lt: __webpack_require__(/*! ./functions/lt */ "./node_modules/semver/functions/lt.js"),
  eq: __webpack_require__(/*! ./functions/eq */ "./node_modules/semver/functions/eq.js"),
  neq: __webpack_require__(/*! ./functions/neq */ "./node_modules/semver/functions/neq.js"),
  gte: __webpack_require__(/*! ./functions/gte */ "./node_modules/semver/functions/gte.js"),
  lte: __webpack_require__(/*! ./functions/lte */ "./node_modules/semver/functions/lte.js"),
  cmp: __webpack_require__(/*! ./functions/cmp */ "./node_modules/semver/functions/cmp.js"),
  coerce: __webpack_require__(/*! ./functions/coerce */ "./node_modules/semver/functions/coerce.js"),
  Comparator: __webpack_require__(/*! ./classes/comparator */ "./node_modules/semver/classes/comparator.js"),
  Range: __webpack_require__(/*! ./classes/range */ "./node_modules/semver/classes/range.js"),
  satisfies: __webpack_require__(/*! ./functions/satisfies */ "./node_modules/semver/functions/satisfies.js"),
  toComparators: __webpack_require__(/*! ./ranges/to-comparators */ "./node_modules/semver/ranges/to-comparators.js"),
  maxSatisfying: __webpack_require__(/*! ./ranges/max-satisfying */ "./node_modules/semver/ranges/max-satisfying.js"),
  minSatisfying: __webpack_require__(/*! ./ranges/min-satisfying */ "./node_modules/semver/ranges/min-satisfying.js"),
  minVersion: __webpack_require__(/*! ./ranges/min-version */ "./node_modules/semver/ranges/min-version.js"),
  validRange: __webpack_require__(/*! ./ranges/valid */ "./node_modules/semver/ranges/valid.js"),
  outside: __webpack_require__(/*! ./ranges/outside */ "./node_modules/semver/ranges/outside.js"),
  gtr: __webpack_require__(/*! ./ranges/gtr */ "./node_modules/semver/ranges/gtr.js"),
  ltr: __webpack_require__(/*! ./ranges/ltr */ "./node_modules/semver/ranges/ltr.js"),
  intersects: __webpack_require__(/*! ./ranges/intersects */ "./node_modules/semver/ranges/intersects.js"),
  simplifyRange: __webpack_require__(/*! ./ranges/simplify */ "./node_modules/semver/ranges/simplify.js"),
}


/***/ }),

/***/ "./node_modules/semver/internal/constants.js":
/*!***************************************************!*\
  !*** ./node_modules/semver/internal/constants.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0'

const MAX_LENGTH = 256
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16

module.exports = {
  SEMVER_SPEC_VERSION,
  MAX_LENGTH,
  MAX_SAFE_INTEGER,
  MAX_SAFE_COMPONENT_LENGTH
}


/***/ }),

/***/ "./node_modules/semver/internal/debug.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/internal/debug.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

const debug = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {}

module.exports = debug


/***/ }),

/***/ "./node_modules/semver/internal/identifiers.js":
/*!*****************************************************!*\
  !*** ./node_modules/semver/internal/identifiers.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

const numeric = /^[0-9]+$/
const compareIdentifiers = (a, b) => {
  const anum = numeric.test(a)
  const bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)

module.exports = {
  compareIdentifiers,
  rcompareIdentifiers
}


/***/ }),

/***/ "./node_modules/semver/internal/re.js":
/*!********************************************!*\
  !*** ./node_modules/semver/internal/re.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const { MAX_SAFE_COMPONENT_LENGTH } = __webpack_require__(/*! ./constants */ "./node_modules/semver/internal/constants.js")
const debug = __webpack_require__(/*! ./debug */ "./node_modules/semver/internal/debug.js")
exports = module.exports = {}

// The actual regexps go on exports.re
const re = exports.re = []
const src = exports.src = []
const t = exports.t = {}
let R = 0

const createToken = (name, value, isGlobal) => {
  const index = R++
  debug(index, value)
  t[name] = index
  src[index] = value
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined)
}

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*')
createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+')

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*')

// ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})`)

createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`)

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`)

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`)

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)

createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+')

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`)

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`)

createToken('FULL', `^${src[t.FULLPLAIN]}$`)

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`)

createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)

createToken('GTLT', '((?:<|>)?=?)')

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)

createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
                   `)?)?`)

createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
                        `)?)?`)

createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCE', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:$|[^\\d])`)
createToken('COERCERTL', src[t.COERCE], true)

// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)')

createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true)
exports.tildeTrimReplace = '$1~'

createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)

// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)')

createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
exports.caretTrimReplace = '$1^'

createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)

// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
exports.comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                   `\\s+-\\s+` +
                   `(${src[t.XRANGEPLAIN]})` +
                   `\\s*$`)

createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s+-\\s+` +
                        `(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s*$`)

// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*')


/***/ }),

/***/ "./node_modules/semver/ranges/gtr.js":
/*!*******************************************!*\
  !*** ./node_modules/semver/ranges/gtr.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// Determine if version is greater than all the versions possible in the range.
const outside = __webpack_require__(/*! ./outside */ "./node_modules/semver/ranges/outside.js")
const gtr = (version, range, options) => outside(version, range, '>', options)
module.exports = gtr


/***/ }),

/***/ "./node_modules/semver/ranges/intersects.js":
/*!**************************************************!*\
  !*** ./node_modules/semver/ranges/intersects.js ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/semver/classes/range.js")
const intersects = (r1, r2, options) => {
  r1 = new Range(r1, options)
  r2 = new Range(r2, options)
  return r1.intersects(r2)
}
module.exports = intersects


/***/ }),

/***/ "./node_modules/semver/ranges/ltr.js":
/*!*******************************************!*\
  !*** ./node_modules/semver/ranges/ltr.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const outside = __webpack_require__(/*! ./outside */ "./node_modules/semver/ranges/outside.js")
// Determine if version is less than all the versions possible in the range
const ltr = (version, range, options) => outside(version, range, '<', options)
module.exports = ltr


/***/ }),

/***/ "./node_modules/semver/ranges/max-satisfying.js":
/*!******************************************************!*\
  !*** ./node_modules/semver/ranges/max-satisfying.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/semver/classes/range.js")

const maxSatisfying = (versions, range, options) => {
  let max = null
  let maxSV = null
  let rangeObj = null
  try {
    rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v
        maxSV = new SemVer(max, options)
      }
    }
  })
  return max
}
module.exports = maxSatisfying


/***/ }),

/***/ "./node_modules/semver/ranges/min-satisfying.js":
/*!******************************************************!*\
  !*** ./node_modules/semver/ranges/min-satisfying.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/semver/classes/range.js")
const minSatisfying = (versions, range, options) => {
  let min = null
  let minSV = null
  let rangeObj = null
  try {
    rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v
        minSV = new SemVer(min, options)
      }
    }
  })
  return min
}
module.exports = minSatisfying


/***/ }),

/***/ "./node_modules/semver/ranges/min-version.js":
/*!***************************************************!*\
  !*** ./node_modules/semver/ranges/min-version.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/semver/classes/range.js")
const gt = __webpack_require__(/*! ../functions/gt */ "./node_modules/semver/functions/gt.js")

const minVersion = (range, loose) => {
  range = new Range(range, loose)

  let minver = new SemVer('0.0.0')
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0')
  if (range.test(minver)) {
    return minver
  }

  minver = null
  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i]

    comparators.forEach((comparator) => {
      // Clone to avoid manipulating the comparator's semver object.
      const compver = new SemVer(comparator.semver.version)
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++
          } else {
            compver.prerelease.push(0)
          }
          compver.raw = compver.format()
          /* fallthrough */
        case '':
        case '>=':
          if (!minver || gt(minver, compver)) {
            minver = compver
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error(`Unexpected operation: ${comparator.operator}`)
      }
    })
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}
module.exports = minVersion


/***/ }),

/***/ "./node_modules/semver/ranges/outside.js":
/*!***********************************************!*\
  !*** ./node_modules/semver/ranges/outside.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const SemVer = __webpack_require__(/*! ../classes/semver */ "./node_modules/semver/classes/semver.js")
const Comparator = __webpack_require__(/*! ../classes/comparator */ "./node_modules/semver/classes/comparator.js")
const {ANY} = Comparator
const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/semver/classes/range.js")
const satisfies = __webpack_require__(/*! ../functions/satisfies */ "./node_modules/semver/functions/satisfies.js")
const gt = __webpack_require__(/*! ../functions/gt */ "./node_modules/semver/functions/gt.js")
const lt = __webpack_require__(/*! ../functions/lt */ "./node_modules/semver/functions/lt.js")
const lte = __webpack_require__(/*! ../functions/lte */ "./node_modules/semver/functions/lte.js")
const gte = __webpack_require__(/*! ../functions/gte */ "./node_modules/semver/functions/gte.js")

const outside = (version, range, hilo, options) => {
  version = new SemVer(version, options)
  range = new Range(range, options)

  let gtfn, ltefn, ltfn, comp, ecomp
  switch (hilo) {
    case '>':
      gtfn = gt
      ltefn = lte
      ltfn = lt
      comp = '>'
      ecomp = '>='
      break
    case '<':
      gtfn = lt
      ltefn = gte
      ltfn = gt
      comp = '<'
      ecomp = '<='
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i]

    let high = null
    let low = null

    comparators.forEach((comparator) => {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0')
      }
      high = high || comparator
      low = low || comparator
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator
      }
    })

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

module.exports = outside


/***/ }),

/***/ "./node_modules/semver/ranges/simplify.js":
/*!************************************************!*\
  !*** ./node_modules/semver/ranges/simplify.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

// given a set of versions and a range, create a "simplified" range
// that includes the same versions that the original range does
// If the original range is shorter than the simplified one, return that.
const satisfies = __webpack_require__(/*! ../functions/satisfies.js */ "./node_modules/semver/functions/satisfies.js")
const compare = __webpack_require__(/*! ../functions/compare.js */ "./node_modules/semver/functions/compare.js")
module.exports = (versions, range, options) => {
  const set = []
  let min = null
  let prev = null
  const v = versions.sort((a, b) => compare(a, b, options))
  for (const version of v) {
    const included = satisfies(version, range, options)
    if (included) {
      prev = version
      if (!min)
        min = version
    } else {
      if (prev) {
        set.push([min, prev])
      }
      prev = null
      min = null
    }
  }
  if (min)
    set.push([min, null])

  const ranges = []
  for (const [min, max] of set) {
    if (min === max)
      ranges.push(min)
    else if (!max && min === v[0])
      ranges.push('*')
    else if (!max)
      ranges.push(`>=${min}`)
    else if (min === v[0])
      ranges.push(`<=${max}`)
    else
      ranges.push(`${min} - ${max}`)
  }
  const simplified = ranges.join(' || ')
  const original = typeof range.raw === 'string' ? range.raw : String(range)
  return simplified.length < original.length ? simplified : range
}


/***/ }),

/***/ "./node_modules/semver/ranges/to-comparators.js":
/*!******************************************************!*\
  !*** ./node_modules/semver/ranges/to-comparators.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/semver/classes/range.js")

// Mostly just for testing and legacy API reasons
const toComparators = (range, options) =>
  new Range(range, options).set
    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '))

module.exports = toComparators


/***/ }),

/***/ "./node_modules/semver/ranges/valid.js":
/*!*********************************************!*\
  !*** ./node_modules/semver/ranges/valid.js ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Range = __webpack_require__(/*! ../classes/range */ "./node_modules/semver/classes/range.js")
const validRange = (range, options) => {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}
module.exports = validRange


/***/ }),

/***/ "./src/blank-line-jumper.ts":
/*!**********************************!*\
  !*** ./src/blank-line-jumper.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
class BlankLineJumper {
    constructor(context) {
        context.subscriptions.push(vscode.commands.registerCommand("metaGo.gotoEmptyLineUp", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, true));
        }));
        context.subscriptions.push(vscode.commands.registerCommand("metaGo.gotoEmptyLineDown", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, false));
        }));
        context.subscriptions.push(vscode.commands.registerCommand("metaGo.selectEmptyLineUp", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, true), editor.selection.anchor);
        }));
        context.subscriptions.push(vscode.commands.registerCommand("metaGo.selectEmptyLineDown", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, false), editor.selection.anchor);
        }));
    }
    nextPosition(document, position, up = false) {
        const step = up ? -1 : 1;
        const boundary = up ? 0 : document.lineCount - 1;
        let index = position.line + step;
        if (position.line === boundary)
            return position.line;
        return this.afterBlock(document, step, boundary, position.line);
    }
    afterBlock(document, step, boundary, index, startedBlock = false) {
        const line = document.lineAt(index);
        return index === boundary || startedBlock && line.isEmptyOrWhitespace
            ? index
            : this.afterBlock(document, step, boundary, index + step, startedBlock || !line.isEmptyOrWhitespace);
    }
    markSelection(editor, next, anchor) {
        const active = editor.selection.active.with(next, 0);
        editor.selection = new vscode.Selection(anchor || active, active);
        editor.revealRange(new vscode.Range(active, active));
    }
}
exports.BlankLineJumper = BlankLineJumper;


/***/ }),

/***/ "./src/bookmark/config.ts":
/*!********************************!*\
  !*** ./src/bookmark/config.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
class BookmarkConfig {
    loadConfig() {
        let config = vscode.workspace.getConfiguration("metaGo");
        this.pathIcon = config.get("bookmark.gutterIconPath", "");
        this.saveBookmarksInProject = config.get('bookmark.saveBookmarksInProject', true);
    }
}
exports.BookmarkConfig = BookmarkConfig;


/***/ }),

/***/ "./src/bookmark/decoration.ts":
/*!************************************!*\
  !*** ./src/bookmark/decoration.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs = __webpack_require__(/*! fs */ "fs");
const vscode = __webpack_require__(/*! vscode */ "vscode");
class Decoration {
    constructor(config, context, manager) {
        this.config = config;
        this.context = context;
        this.manager = manager;
        this.update = () => {
            let activeEditor = vscode.window.activeTextEditor;
            if (!activeEditor) {
                return;
            }
            if (!this.manager.activeDocument) {
                return;
            }
            if (this.manager.activeDocument.bookmarks.size === 0) {
                this.clear();
                return;
            }
            const lineMarks = [];
            const charMarks = []; //vscode.DecorationOptions[] = [];
            if (activeEditor.document.lineCount === 1 && activeEditor.document.lineAt(0).text === "") {
                this.manager.activeDocument.clear();
            }
            else {
                let invalids = [];
                for (let [key, bm] of this.manager.activeDocument.bookmarks) {
                    if (bm.line <= activeEditor.document.lineCount) {
                        const lineDecoration = new vscode.Range(bm.line, 0, bm.line, 0);
                        lineMarks.push(lineDecoration);
                        // const charDecorationOption = {
                        //     range: new vscode.Range(bm.line, bm.char, bm.line, bm.char),
                        //     // renderOptions: {
                        //     //     dark: {
                        //     //         after: {
                        //     //             contentIconPath: this.buildUri()
                        //     //         }
                        //     //     },
                        //     //     light: {
                        //     //         after: {
                        //     //             contentIconPath: this.buildUri()
                        //     //         }
                        //     //     }
                        //     // }
                        // };
                        charMarks.push(new vscode.Range(bm.line, bm.char, bm.line, bm.char));
                    }
                    else {
                        invalids.push(key);
                    }
                }
                if (invalids.length > 0) {
                    let idxInvalid;
                    for (const key of invalids) {
                        this.manager.activeDocument.removeBookmark(key);
                    }
                }
            }
            activeEditor.setDecorations(this.lineDecorationType, lineMarks);
            activeEditor.setDecorations(this.charDecorationType, charMarks);
        };
        this.buildUri = () => {
            let width = 6;
            let height = 18;
            let bgColor = 'blue';
            let bgOpacity = '1';
            let borderColor = 'lightblue';
            let svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" height="${height}" width="${width}"><rect width="${width}" height="${height}" rx="0" ry="0" style="fill: ${bgColor};fill-opacity:${bgOpacity};stroke:${borderColor};stroke-opacity:${bgOpacity};"/></svg>`;
            return vscode.Uri.parse(svg);
        };
        if (config.pathIcon !== "") {
            if (!fs.existsSync(config.pathIcon)) {
                vscode.window.showErrorMessage('The file "' + config.pathIcon + '" used for "this.bookmarks.gutterIconPath" does not exists.');
                config.pathIcon = this.context.asAbsolutePath("images\\bookmark.png");
            }
        }
        else {
            config.pathIcon = this.context.asAbsolutePath("images\\bookmark.png");
        }
        config.pathIcon = config.pathIcon.replace(/\\/g, "/");
        this.lineDecorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: config.pathIcon,
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            overviewRulerColor: "rgba(21, 126, 251, 0.7)"
        });
        this.charDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255,0,0,0.3)',
            borderWidth: '1px',
            borderStyle: 'solid',
            light: {
                // this color will be used in light color themes
                borderColor: 'darkblue'
            },
            dark: {
                // this color will be used in dark color themes
                borderColor: 'mediumblue '
            }
        });
    }
    clear() {
        let books = [];
        vscode.window.activeTextEditor.setDecorations(this.lineDecorationType, books);
        vscode.window.activeTextEditor.setDecorations(this.charDecorationType, books);
    }
}
exports.Decoration = Decoration;


/***/ }),

/***/ "./src/bookmark/index.ts":
/*!*******************************!*\
  !*** ./src/bookmark/index.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const document_1 = __webpack_require__(/*! ./model/document */ "./src/bookmark/model/document.ts");
const location_1 = __webpack_require__(/*! ./model/location */ "./src/bookmark/model/location.ts");
const manager_1 = __webpack_require__(/*! ./manager */ "./src/bookmark/manager.ts");
const storage_1 = __webpack_require__(/*! ./storage */ "./src/bookmark/storage.ts");
const decoration_1 = __webpack_require__(/*! ./decoration */ "./src/bookmark/decoration.ts");
const selection_1 = __webpack_require__(/*! ./selection */ "./src/bookmark/selection.ts");
const sticky_1 = __webpack_require__(/*! ./sticky */ "./src/bookmark/sticky.ts");
const document_2 = __webpack_require__(/*! ./model/document */ "./src/bookmark/model/document.ts");
class BookmarkExt {
    constructor(context, config) {
        this.context = context;
        this.config = config;
        this.expandLineRange = (editor, toLine, direction) => {
            const doc = editor.document;
            let newSe;
            let actualSelection = editor.selection;
            // no matter 'the previous selection'. going FORWARD will become 'isReversed = FALSE'
            if (direction === location_1.JumpDirection.FORWARD) {
                if (actualSelection.isEmpty || !actualSelection.isReversed) {
                    newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, doc.lineAt(toLine).text.length);
                }
                else {
                    newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, doc.lineAt(toLine).text.length);
                }
            }
            else { // going BACKWARD will become 'isReversed = TRUE'
                if (actualSelection.isEmpty || !actualSelection.isReversed) {
                    newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, 0);
                }
                else {
                    newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, 0);
                }
            }
            editor.selection = newSe;
        };
        this.shrinkLineRange = (editor, toLine, direction) => {
            const doc = editor.document;
            let newSe;
            // no matter 'the previous selection'. going FORWARD will become 'isReversed = FALSE'
            if (direction === location_1.JumpDirection.FORWARD) {
                newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, 0);
            }
            else { // going BACKWARD , select to line length
                newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, doc.lineAt(toLine).text.length);
            }
            editor.selection = newSe;
        };
        this.gotoBookmarkInActiveDoc = (bm) => {
            let reviewType = vscode.TextEditorRevealType.InCenter;
            if (bm.line === vscode.window.activeTextEditor.selection.active.line) {
                reviewType = vscode.TextEditorRevealType.InCenterIfOutsideViewport;
            }
            let textInLine = vscode.window.activeTextEditor.document.lineAt(bm.line).text;
            if (bm.char > textInLine.length)
                bm.char = textInLine.length;
            let newSe = new vscode.Selection(bm.line, bm.char, bm.line, bm.char);
            vscode.window.activeTextEditor.selection = newSe;
            vscode.window.activeTextEditor.revealRange(newSe, reviewType);
        };
        this.gotoBookmark = (bookmarkModel, preserveFocus = false) => {
            const bm = bookmarkModel.bookmark;
            const doc = bookmarkModel.document;
            const uri = document_2.Document.normalize(vscode.window.activeTextEditor.document.uri.fsPath);
            if (doc.key !== uri) {
                let uriDocument = vscode.Uri.file(doc.key);
                vscode.workspace.openTextDocument(uriDocument).then(doc => {
                    vscode.window.showTextDocument(doc, { preserveFocus, preview: true }).then(editor => {
                        this.gotoBookmarkInActiveDoc(bm);
                    });
                });
            }
            this.gotoBookmarkInActiveDoc(bm);
        };
        this.removeRootPathFrom = (path) => {
            if (!vscode.workspace.rootPath) {
                return path;
            }
            if (path.indexOf(vscode.workspace.rootPath) === 0) {
                return "$(tag) " + path.split(vscode.workspace.rootPath).pop();
            }
            else {
                return "$(link) " + path;
            }
        };
        this.registerCommands = () => {
            vscode.commands.registerCommand("metaGo.bookmark.expandSelectionToNext", () => this.selection.expandSelectionToNextBookmark(location_1.JumpDirection.FORWARD));
            vscode.commands.registerCommand("metaGo.bookmark.expandSelectionToPrevious", () => this.selection.expandSelectionToNextBookmark(location_1.JumpDirection.BACKWARD));
            vscode.commands.registerCommand("metaGo.bookmark.shrinkSelection", () => this.selection.shrinkSelection());
            vscode.commands.registerCommand("metaGo.bookmark.clearInFile", () => {
                if (!vscode.window.activeTextEditor) {
                    vscode.window.showInformationMessage("Open a file first to clear bookmarks");
                    return;
                }
                this.manager.activeDocument.clear();
                this.storage.save();
                this.decoration.clear();
            });
            vscode.commands.registerCommand("metaGo.bookmark.clear", () => {
                this.manager.clear();
                this.storage.save();
                this.decoration.clear();
            });
            vscode.commands.registerCommand("metaGo.bookmark.selectLines", () => {
                if (!vscode.window.activeTextEditor) {
                    vscode.window.showInformationMessage("Open a file first to clear bookmarks");
                    return;
                }
                if (this.manager.activeDocument.bookmarks.size === 0) {
                    vscode.window.showInformationMessage("No Bookmark found");
                    return;
                }
                this.selection.selectLines(vscode.window.activeTextEditor);
            });
            vscode.commands.registerCommand("metaGo.bookmark.toggle", () => {
                try {
                    this.manager.toggleBookmark();
                    this.storage.save();
                    this.decoration.update();
                }
                catch (err) {
                    console.log(err);
                }
            });
            vscode.commands.registerCommand("metaGo.bookmark.next", () => {
                if (!vscode.window.activeTextEditor) {
                    vscode.window.showInformationMessage("Open a file first to jump to bookmarks");
                    return;
                }
                if (!this.manager.activeDocument) {
                    return;
                }
                this.manager.nextBookmark(location_1.JumpDirection.FORWARD)
                    .then((location) => {
                    if (location === location_1.BookmarkLocation.NO_BOOKMARKS) {
                        vscode.window.showInformationMessage("No bookmarks...");
                    }
                    else {
                        this.gotoBookmark(location);
                    }
                })
                    .catch((error) => {
                    console.log("nextBookmark REJECT" + error);
                });
            });
            vscode.commands.registerCommand("metaGo.bookmark.previous", () => {
                if (!vscode.window.activeTextEditor) {
                    vscode.window.showInformationMessage("Open a file first to jump to this.bookmarks");
                    return;
                }
                if (!this.manager.activeDocument) {
                    return;
                }
                this.manager.nextBookmark(location_1.JumpDirection.BACKWARD)
                    .then((location) => {
                    if (location === location_1.BookmarkLocation.NO_BOOKMARKS) {
                        vscode.window.showInformationMessage("No bookmarks...");
                    }
                    else {
                        this.gotoBookmark(location);
                    }
                })
                    .catch((error) => {
                    console.log("nextBookmark REJECT" + error);
                });
            });
            vscode.commands.registerCommand("metaGo.bookmark.view", () => {
                if (this.manager.size === 0) {
                    vscode.window.showInformationMessage("No Bookmarks found");
                    return;
                }
                // push the items
                let items = [];
                let activeTextEditorPath = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri.fsPath : "";
                let promises = [];
                let currentLine = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.selection.active.line + 1 : -1;
                for (let [key, doc] of this.manager.documents) {
                    let pp = doc.getBookmarkItems();
                    promises.push(pp);
                }
                Promise.all(promises).then((values) => {
                    for (let index = 0; index < values.length; index++) {
                        let element = values[index];
                        for (let indexInside = 0; indexInside < element.length; indexInside++) {
                            let elementInside = element[indexInside];
                            if (elementInside.detail.toString().toLowerCase() === activeTextEditorPath.toLowerCase()) {
                                items.push(new document_1.BookmarkItem(elementInside.label, elementInside.description, null, null, elementInside.location));
                            }
                            else {
                                let itemPath = this.removeRootPathFrom(elementInside.detail);
                                items.push(new document_1.BookmarkItem(elementInside.label, elementInside.description, itemPath, null, elementInside.location));
                            }
                        }
                    }
                    // sort
                    // - active document
                    // - no Octicons - document inside project
                    // - with Octicons - document outside project
                    let itemsSorted;
                    itemsSorted = items.sort(function (a, b) {
                        if (!a.detail && !b.detail) {
                            return 0;
                        }
                        else {
                            if (!a.detail && b.detail) {
                                return -1;
                            }
                            else {
                                if (a.detail && !b.detail) {
                                    return 1;
                                }
                                else {
                                    if ((a.detail.toString().indexOf("$(link) ") === 0) && (b.detail.toString().indexOf("$(link) ") === -1)) {
                                        return 1;
                                    }
                                    else {
                                        if ((a.detail.toString().indexOf("$(link) ") === -1) && (b.detail.toString().indexOf("$(link) ") === 0)) {
                                            return -1;
                                        }
                                        else {
                                            return 0;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    items.push(new document_1.BookmarkItem('c', 'clear bookmarks in current file', null, 'metaGo.bookmark.clearInFile'));
                    items.push(new document_1.BookmarkItem('cc', 'clear all bookmarks in workspace', null, 'metaGo.bookmark.clear'));
                    items.splice(0, 0, new document_1.BookmarkItem('p', 'jump to previous bookmark', null, 'metaGo.bookmark.previous'));
                    items.splice(0, 0, new document_1.BookmarkItem('n', 'jump to next bookmark', null, 'metaGo.bookmark.next'));
                    let options = {
                        placeHolder: "Type a line number or a piece of code to navigate to",
                        matchOnDescription: true,
                        // ignoreFocusOut: true,
                        onDidSelectItem: (item) => {
                            let filePath;
                            if (item.commandId)
                                return;
                            // no detail - previously active document
                            if (!item.detail) {
                                filePath = activeTextEditorPath;
                            }
                            else {
                                // with icon - document outside project
                                if (item.detail.toString().indexOf("$(link) ") === 0) {
                                    filePath = item.detail.toString().split("$(link) ").pop();
                                }
                                else if (item.detail.toString().indexOf("$(tag) ") === 0) { // tag - document inside project
                                    filePath = vscode.workspace.rootPath + item.detail.toString().split("$(tag) ").pop();
                                }
                                else { // no icon
                                    filePath = vscode.workspace.rootPath + item.detail.toString();
                                }
                            }
                            this.gotoBookmark(item.location, true);
                        }
                    };
                    vscode.window.showQuickPick(itemsSorted, options).then((selection) => {
                        if (typeof selection === "undefined") {
                            return;
                        }
                        if (selection.commandId) {
                            vscode.commands.executeCommand(selection.commandId);
                            return;
                        }
                        else {
                            this.gotoBookmark(selection.location);
                        }
                    });
                });
            });
        };
        this.manager = new manager_1.BookmarkManager();
        this.storage = new storage_1.Storage(this.config, this.context, this.manager);
        this.decoration = new decoration_1.Decoration(this.config, this.context, this.manager);
        this.selection = new selection_1.Selection(this.manager);
        this.sticky = new sticky_1.StickyBookmark(this.manager);
        this.storage.load();
        // Timeout
        let timeout = null;
        let triggerUpdateDecorations = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(this.decoration.update, 100);
        };
        let activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            this.sticky.activeEditorCountLine = activeEditor.document.lineCount;
            this.manager.activeDocument = this.manager.addDocumentIfNotExist(activeEditor.document.uri.fsPath);
            triggerUpdateDecorations();
        }
        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = vscode.window.activeTextEditor;
            if (editor) {
                this.sticky.activeEditorCountLine = editor.document.lineCount;
                this.manager.activeDocument = this.manager.addDocumentIfNotExist(editor.document.uri.fsPath);
                triggerUpdateDecorations();
            }
        }, null, context.subscriptions);
        vscode.workspace.onDidOpenTextDocument(doc => {
            this.manager.addDocumentIfNotExist(doc.uri.fsPath);
        });
        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                let updatedBookmark = true;
                if (this.manager.activeDocument && this.manager.activeDocument.bookmarks.size > 0) {
                    updatedBookmark = this.sticky.stickyBookmarks(event);
                }
                this.sticky.activeEditorCountLine = event.document.lineCount;
                this.decoration.update();
                if (updatedBookmark) {
                    this.storage.save();
                }
            }
        }, null, context.subscriptions);
        this.registerCommands();
    }
}
exports.BookmarkExt = BookmarkExt;


/***/ }),

/***/ "./src/bookmark/manager.ts":
/*!*********************************!*\
  !*** ./src/bookmark/manager.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const fs = __webpack_require__(/*! fs */ "fs");
const document_1 = __webpack_require__(/*! ./model/document */ "./src/bookmark/model/document.ts");
const bookmark_1 = __webpack_require__(/*! ./model/bookmark */ "./src/bookmark/model/bookmark.ts");
const history_1 = __webpack_require__(/*! ./model/history */ "./src/bookmark/model/history.ts");
const location_1 = __webpack_require__(/*! ./model/location */ "./src/bookmark/model/location.ts");
class BookmarkManager {
    constructor() {
        this.documents = new Map();
        this.history = new history_1.History();
        this._activeDocument = undefined;
        this.addDocumentIfNotExist = (uri, document) => {
            uri = document_1.Document.normalize(uri);
            if (!this.documents.has(uri)) {
                let doc;
                if (document) {
                    doc = document;
                }
                else {
                    doc = new document_1.Document(uri, this.history);
                }
                this.documents.set(uri, doc);
                return doc;
            }
            return this.documents.get(uri);
        };
        this.tidyBookmarks = () => __awaiter(this, void 0, void 0, function* () {
            for (let [key, doc] of this.documents) {
                yield doc.getBookmarkItems();
                if (doc.bookmarks.size === 0) {
                    this.documents.delete(key);
                }
            }
        });
        this.toggleBookmark = () => {
            let editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage("Put the cursor to the text editor to toggle bookmarks");
                return;
            }
            let line = editor.selection.active.line;
            let char = editor.selection.active.character;
            let doc = this.addDocumentIfNotExist(vscode.window.activeTextEditor.document.uri.fsPath);
            this.activeDocument = doc;
            this.activeDocument.toggleBookmark(new bookmark_1.Bookmark(line, char));
        };
        this.nextBookmark = (direction = location_1.JumpDirection.FORWARD) => {
            return new Promise((resolve, reject) => {
                const bm = direction === location_1.JumpDirection.FORWARD ? this.history.next() : this.history.previous();
                if (bm === null) {
                    resolve(location_1.BookmarkLocation.NO_BOOKMARKS);
                    return;
                }
                if (!this.documents.has(bm.documentKey)) {
                    this.history.removeDoc(bm.documentKey);
                    this.nextBookmark().then((bm) => resolve(bm)).catch((e) => reject(e));
                    return;
                }
                if (!this.documents.get(bm.documentKey).bookmarks.has(bm.bookmarkKey)) {
                    this.history.remove(bm.documentKey, bm.bookmarkKey);
                    this.nextBookmark().then((bm) => resolve(bm)).catch((e) => reject(e));
                    return;
                }
                if (!fs.existsSync(bm.documentKey)) {
                    this.documents.delete(bm.documentKey);
                    this.history.removeDoc(bm.documentKey);
                    this.nextBookmark().then((bm) => resolve(bm)).catch((e) => reject(e));
                    return;
                }
                const doc = this.documents.get(bm.documentKey);
                return resolve(new location_1.BookmarkLocation(doc, doc.bookmarks.get(bm.bookmarkKey)));
            });
        };
        this.clear = () => {
            for (let [key, doc] of this.documents) {
                doc.clear();
            }
        };
    }
    get activeDocument() {
        return this._activeDocument;
    }
    set activeDocument(doc) {
        this._activeDocument = doc;
        if (!this.documents.has(doc.key)) {
            this.documents.set(doc.key, doc);
        }
    }
    get size() {
        let counter = 0;
        let func = () => {
            for (let [key, doc] of this.documents) {
                counter += doc.bookmarks.size;
            }
        };
        func();
        return counter;
    }
}
exports.BookmarkManager = BookmarkManager;


/***/ }),

/***/ "./src/bookmark/model/bookmark.ts":
/*!****************************************!*\
  !*** ./src/bookmark/model/bookmark.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
class Bookmark {
    constructor(line, char) {
        this.line = line;
        this.char = char;
    }
    static Create(position) {
        return new Bookmark(position.line, position.character);
    }
    getPosition() {
        return new vscode.Position(this.line, this.char);
    }
    get key() {
        return this.line.toString(); // one bookmark per line //+ ':' + this.char;
    }
}
exports.Bookmark = Bookmark;


/***/ }),

/***/ "./src/bookmark/model/document.ts":
/*!****************************************!*\
  !*** ./src/bookmark/model/document.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const fs = __webpack_require__(/*! fs */ "fs");
const location_1 = __webpack_require__(/*! ./location */ "./src/bookmark/model/location.ts");
class BookmarkItem {
    constructor(label, description, detail, commandId, location) {
        this.label = label;
        this.description = description;
        this.detail = detail;
        this.commandId = commandId;
        this.location = location;
    }
}
exports.BookmarkItem = BookmarkItem;
class Document {
    constructor(key, history) {
        this.key = key;
        this.history = history;
        this.bookmarks = new Map();
        this.addBookmark = (bookmark) => {
            let key = bookmark.key;
            if (this.bookmarks.has(key)) {
                return;
            }
            this.bookmarks.set(key, bookmark);
            this.history.add(this.key, key);
        };
        this.removeBookmark = (bookmark) => {
            let key;
            if (typeof bookmark === 'string') {
                key = bookmark;
            }
            else {
                key = bookmark.key;
            }
            if (!this.bookmarks.has(key)) {
                return;
            }
            this.bookmarks.delete(key);
            this.history.remove(this.key, key);
        };
        this.toggleBookmark = (bookmark) => {
            if (this.bookmarks.has(bookmark.key)) {
                this.removeBookmark(bookmark);
            }
            else {
                this.addBookmark(bookmark);
            }
        };
        this.getBookmarkItems = () => {
            return new Promise((resolve, reject) => {
                if (this.bookmarks.size === 0 || !fs.existsSync(this.key)) {
                    this.history.removeDoc(this.key);
                    resolve([]);
                    return;
                }
                let uriDocBookmark = vscode.Uri.file(this.key);
                vscode.workspace.openTextDocument(uriDocBookmark).then(doc => {
                    let items = [];
                    let invalids = [];
                    for (let [key, value] of this.bookmarks) {
                        let lineNumber = value.line + 1;
                        if (lineNumber <= doc.lineCount) {
                            let lineText = doc.lineAt(lineNumber - 1).text;
                            let normalizedPath = Document.normalize(doc.uri.fsPath);
                            items.push(new BookmarkItem(`${lineNumber}`, lineText, normalizedPath, null, new location_1.BookmarkLocation(this, value)));
                        }
                        else {
                            invalids.push(key);
                        }
                    }
                    if (invalids.length > 0) {
                        invalids.forEach((key) => {
                            this.bookmarks.delete(key);
                            this.history.remove(this.key, key);
                        });
                    }
                    resolve(items);
                    return;
                });
            });
        };
        /**
         * clear bookmarks
         */
        this.clear = () => {
            this.bookmarks.clear();
            this.history.removeDoc(this.key);
        };
    }
    static normalize(uri) {
        // a simple workaround for what appears to be a vscode.Uri bug
        // (inconsistent fsPath values for the same document, ex. ///foo/x.cpp and /foo/x.cpp)
        return uri.replace("///", "/");
    }
    getBookmarkKeys(line, char = -1) {
        const bms = [];
        for (let [key, bm] of this.bookmarks) {
            let charEqual = true;
            if (char !== -1) {
                charEqual = bm.char === char;
            }
            if (bm.line === line && charEqual) {
                bms.push(key);
            }
        }
        return bms;
    }
    getBookmarks(line, char = -1) {
        const bms = [];
        for (let [key, bm] of this.bookmarks) {
            let charEqual = true;
            if (char !== -1) {
                charEqual = bm.char === char;
            }
            if (bm.line === line && charEqual) {
                bms.push(bm);
            }
        }
        return bms;
    }
    modifyBookmark(bookmark, toLine, toChar = -1) {
        const keyBackup = bookmark.key;
        if (bookmark.line === toLine && (toChar === -1 || bookmark.char === toChar))
            return;
        this.bookmarks.delete(keyBackup);
        bookmark.line = toLine;
        if (toChar != -1)
            bookmark.char = toChar;
        let bmReturn = null;
        if (this.bookmarks.has(bookmark.key)) {
            bmReturn = this.bookmarks.get(bookmark.key);
            this.bookmarks.delete(bookmark.key);
        }
        this.bookmarks.set(bookmark.key, bookmark);
        this.history.modify(this.key, keyBackup, bookmark.key);
        return bmReturn;
    }
    modifyBookmarkByLine(line, toLine, char = -1, toChar = -1) {
    }
    removeBookmarks(line) {
        const bms = this.getBookmarkKeys(line);
        bms.forEach(key => this.removeBookmark(key));
        return bms.length > 0;
    }
}
exports.Document = Document;


/***/ }),

/***/ "./src/bookmark/model/history.ts":
/*!***************************************!*\
  !*** ./src/bookmark/model/history.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class HistoryItem {
    constructor(documentKey, bookmarkKey) {
        this.documentKey = documentKey;
        this.bookmarkKey = bookmarkKey;
    }
}
exports.HistoryItem = HistoryItem;
class History {
    constructor() {
        this.history = new Array();
        this.add = (docKey, bkKey) => {
            let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
            if (i !== -1) {
                this.index = i;
                return;
            }
            const item = new HistoryItem(docKey, bkKey);
            const len = this.history.length;
            if (len === 0) {
                this.index = 0;
                this.history.push(item);
                return item;
            }
            this.history.splice(++this.index, 0, item);
            return item;
        };
        this.remove = (docKey, bkKey) => {
            let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
            if (i === -1)
                return null;
            const len = this.history.length;
            if (len !== 1 && this.index >= i && this.index === len - 1) {
                this.index = 0;
            }
            const rm = this.history.splice(i, 1);
            if (this.history.length === 0)
                this.index = -1;
            return rm[0];
        };
        this.removeDoc = (docKey) => {
            this.history = this.history.filter((hi) => hi.documentKey !== docKey);
            this.index = Math.min(this.index, this.history.length);
        };
        this.clear = () => {
            this.history.length = 0;
            this.index = -1;
        };
        this.goto = (docKey, bkKey) => {
            let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
            if (i === -1) {
                return false;
            }
            this.index = i;
        };
        this.replace = (docKey, bkKey, toDocKey, toBkKey) => {
            let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
            if (i !== -1) {
                this.history[i].bookmarkKey = toDocKey;
                this.history[i].documentKey = toDocKey;
            }
        };
        this.next = () => {
            const len = this.history.length;
            if (len === 0)
                return null;
            if (this.index + 1 === len) {
                this.index = 0;
                return this.history[0];
            }
            return this.history[++this.index];
        };
        this.previous = () => {
            const len = this.history.length;
            if (len === 0)
                return null;
            if (this.index === 0) {
                this.index = len - 1;
                return this.history[this.index];
            }
            return this.history[--this.index];
        };
    }
    modify(docKey, bkKey, bkKeyNew) {
        let i = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKey);
        if (i === -1)
            return;
        let j = this.history.findIndex((e) => e.documentKey === docKey && e.bookmarkKey === bkKeyNew);
        if (j !== -1) {
            this.remove(docKey, bkKeyNew);
        }
        this.history[i].bookmarkKey = bkKeyNew;
    }
}
exports.History = History;


/***/ }),

/***/ "./src/bookmark/model/location.ts":
/*!****************************************!*\
  !*** ./src/bookmark/model/location.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const bookmark_1 = __webpack_require__(/*! ./bookmark */ "./src/bookmark/model/bookmark.ts");
var JumpDirection;
(function (JumpDirection) {
    JumpDirection[JumpDirection["FORWARD"] = 0] = "FORWARD";
    JumpDirection[JumpDirection["BACKWARD"] = 1] = "BACKWARD";
})(JumpDirection = exports.JumpDirection || (exports.JumpDirection = {}));
;
class BookmarkLocation {
    constructor(document, bookmark) {
        this.document = document;
        this.bookmark = bookmark;
    }
}
exports.BookmarkLocation = BookmarkLocation;
BookmarkLocation.NO_BOOKMARKS = new BookmarkLocation(null, new bookmark_1.Bookmark(-1, 0));


/***/ }),

/***/ "./src/bookmark/selection.ts":
/*!***********************************!*\
  !*** ./src/bookmark/selection.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Selection {
    constructor(manager) {
        this.manager = manager;
    }
    selectLines(editor) {
        // const doc = editor.document;
        // editor.selections.shift();
        // let selections = new Array<vscode.Selection>();
        // let newSe;
        // lines.forEach(line => {
        //     newSe = new vscode.Selection(line.line, 0, line.line, doc.lineAt(line.line).text.length);
        //     selections.push(newSe);
        // });
        // editor.selections = selections;
    }
    shrinkSelection() {
        // if (!vscode.window.activeTextEditor) {
        //     vscode.window.showInformationMessage("Open a file first to shrink bookmark selection");
        //     return;
        // }
        // if (vscode.window.activeTextEditor.selections.length > 1) {
        //     vscode.window.showInformationMessage("Command not supported with more than one selection");
        //     return;
        // }
        // if (vscode.window.activeTextEditor.selection.isEmpty) {
        //     vscode.window.showInformationMessage("No selection found");
        //     return;
        // }
        // if (this.manager.activeDocument.bookmarks.length === 0) {
        //     vscode.window.showInformationMessage("No Bookmark found");
        //     return;
        // }
        // // which direction?
        // let direction: JumpDirection = vscode.window.activeTextEditor.selection.isReversed ? JumpDirection.FORWARD : JumpDirection.BACKWARD;
        // let activeSelectionStartLine: number = vscode.window.activeTextEditor.selection.isReversed ? vscode.window.activeTextEditor.selection.end.line : vscode.window.activeTextEditor.selection.start.line;
        // let pos: vscode.Position;
        // if (direction === JumpDirection.FORWARD) {
        //     pos = vscode.window.activeTextEditor.selection.start;
        // } else {
        //     pos = vscode.window.activeTextEditor.selection.end;
        // }
        // this.manager.activeDocument.nextBookmark(pos, direction)
        //     .then((nextLine) => {
        //         if ((nextLine === Bookmark.NO_MORE_BOOKMARKS) || (nextLine === Bookmark.NO_BOOKMARKS)) {
        //             vscode.window.setStatusBarMessage("No more bookmarks", 2000);
        //             return;
        //         } else {
        //             if ((direction === JumpDirection.BACKWARD && nextLine.line < activeSelectionStartLine) ||
        //                 (direction === JumpDirection.FORWARD && nextLine.line > activeSelectionStartLine)) {
        //                 // vscode.window.showInformationMessage('No more this.bookmarks.to shrink...');
        //                 vscode.window.setStatusBarMessage("No more this.bookmarks.to shrink", 2000);
        //             } else {
        //                 this.shrinkLineRange(vscode.window.activeTextEditor, parseInt(nextLine.toString(), 10), direction);
        //             }
        //         }
        //     })
        //     .catch((error) => {
        //         console.log("activeBookmark.nextBookmark REJECT" + error);
        //     });
    }
    expandSelectionToNextBookmark(direction) {
        // if (!vscode.window.activeTextEditor) {
        //     vscode.window.showInformationMessage("Open a file first to clear this.bookmarks");
        //     return;
        // }
        // if (this.manager.activeDocument.bookmarks.length === 0) {
        //     vscode.window.showInformationMessage("No Bookmark found");
        //     return;
        // }
        // if (this.manager.activeDocument.bookmarks.length === 1) {
        //     vscode.window.showInformationMessage("There is only one bookmark in this file");
        //     return;
        // }
        // let pos: vscode.Position;
        // if (vscode.window.activeTextEditor.selection.isEmpty) {
        //     pos = vscode.window.activeTextEditor.selection.active;
        // } else {
        //     if (direction === JumpDirection.FORWARD) {
        //         pos = vscode.window.activeTextEditor.selection.end;
        //     } else {
        //         pos = vscode.window.activeTextEditor.selection.start;
        //     }
        // }
        // this.manager.activeDocument.nextBookmark(pos, direction)
        //     .then((nextLine) => {
        //         if ((nextLine === Bookmark.NO_MORE_BOOKMARKS) || (nextLine === Bookmark.NO_BOOKMARKS)) {
        //             // vscode.window.showInformationMessage('No more bookmarks...');
        //             vscode.window.setStatusBarMessage("No more this.bookmarks", 2000);
        //             return;
        //         } else {
        //             this.expandLineRange(vscode.window.activeTextEditor, parseInt(nextLine.toString(), 10), direction);
        //         }
        //     })
        //     .catch((error) => {
        //         console.log("activeBookmark.nextBookmark REJECT" + error);
        //     });
    }
}
exports.Selection = Selection;


/***/ }),

/***/ "./src/bookmark/sticky.ts":
/*!********************************!*\
  !*** ./src/bookmark/sticky.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const bookmark_1 = __webpack_require__(/*! ./model/bookmark */ "./src/bookmark/model/bookmark.ts");
class StickyBookmark {
    constructor(manager) {
        this.manager = manager;
        this.moveStickyBookmarks = (direction) => {
            let char;
            let updatedBookmark = false;
            let diffLine;
            let selection = vscode.window.activeTextEditor.selection;
            let lineRange = [selection.start.line, selection.end.line];
            let lineMin = Math.min.apply(this, lineRange);
            let lineMax = Math.max.apply(this, lineRange);
            if (selection.end.character === 0 && !selection.isSingleLine) {
                let lineAt = vscode.window.activeTextEditor.document.lineAt(selection.end.line);
                let posMin = new vscode.Position(selection.start.line + 1, selection.start.character);
                let posMax = new vscode.Position(selection.end.line, lineAt.range.end.character);
                vscode.window.activeTextEditor.selection = new vscode.Selection(posMin, posMax);
                lineMax--;
            }
            const doc = this.manager.activeDocument;
            let passiveMoveDiff = lineMax - lineMin + 1;
            let passiveMoveLine;
            if (direction === "up") {
                diffLine = -1;
                passiveMoveLine = lineMin - 1;
            }
            else if (direction === "down") {
                diffLine = 1;
                passiveMoveLine = lineMax + 1;
                passiveMoveDiff = 0 - passiveMoveDiff;
            }
            let bmsOfSameLineAndChar = [];
            let passiveMoveBookmarks = doc.getBookmarks(passiveMoveLine);
            passiveMoveBookmarks.forEach((bm) => {
                const b = doc.modifyBookmark(bm, passiveMoveLine + passiveMoveDiff);
                bmsOfSameLineAndChar.push(b);
            });
            lineRange = [];
            for (let i = lineMin; i <= lineMax; i++) {
                lineRange.push(i);
            }
            lineRange = lineRange.sort();
            if (diffLine > 0) {
                lineRange = lineRange.reverse();
            }
            for (let i of lineRange) {
                for (let bm of doc.bookmarks.values()) {
                    if (bm.line === i) {
                        if (passiveMoveBookmarks.indexOf(bm) !== -1)
                            continue;
                        const toLine = bm.line + diffLine;
                        doc.modifyBookmark(bm, toLine);
                        updatedBookmark = true;
                    }
                }
            }
            bmsOfSameLineAndChar.forEach((bm) => {
                doc.addBookmark(new bookmark_1.Bookmark(bm.line + diffLine, bm.char));
                updatedBookmark = true;
            });
            return updatedBookmark;
        };
    }
    stickyBookmarks(event) {
        let diffLine;
        let updatedBookmark = false;
        let doc = this.manager.activeDocument;
        let bms = doc.bookmarks;
        const range = event.contentChanges[0].range;
        if (this.HadOnlyOneValidContentChange(event)) {
            // add or delete line case
            if (event.document.lineCount !== this.activeEditorCountLine) {
                diffLine = event.document.lineCount - this.activeEditorCountLine;
                // remove lines
                if (event.document.lineCount < this.activeEditorCountLine) {
                    for (let i = range.start.line; i <= range.end.line; i++) {
                        updatedBookmark = doc.removeBookmarks(i) || updatedBookmark;
                    }
                }
                for (let [key, bm] of this.manager.activeDocument.bookmarks) {
                    let eventLine = range.start.line;
                    let eventCharacter = range.start.character;
                    // indent ?
                    if (eventCharacter > 0) {
                        let textInEventLine = vscode.window.activeTextEditor.document.lineAt(eventLine).text;
                        textInEventLine = textInEventLine.replace(/\t/g, "").replace(/\s/g, "");
                        if (textInEventLine === "") {
                            eventCharacter = 0;
                        }
                    }
                    if (((bm.line > eventLine) && (eventCharacter > 0)) || ((bm.line >= eventLine) && (eventCharacter === 0))) {
                        let newLine = bm.line + diffLine;
                        if (newLine < 0) {
                            newLine = 0;
                        }
                        bm.line = newLine;
                        updatedBookmark = true;
                    }
                }
            }
            else if (range.start.line === range.end.line && range.start.character !== range.end.character &&
                event.contentChanges[0].text === '') { // same line: delete before
                const charDiff = range.end.character - range.start.character;
                doc.getBookmarks(range.start.line).forEach((m) => {
                    if (m.char >= range.end.character) {
                        doc.modifyBookmark(m, range.start.line, m.char - charDiff);
                    }
                    else {
                        doc.removeBookmark(m);
                    }
                    updatedBookmark = true;
                });
            }
            else if (range.start.line === range.end.line && range.start.character === range.end.character &&
                event.contentChanges[0].text !== '') { //same line: add before
                doc.getBookmarks(range.start.line).forEach((m) => {
                    if (m.char >= range.end.character) {
                        doc.modifyBookmark(m, range.start.line, m.char + event.contentChanges[0].text.length);
                        updatedBookmark = true;
                    }
                });
            }
            // paste case
            if (!updatedBookmark && (event.contentChanges[0].text.length > 1)) {
                let selection = vscode.window.activeTextEditor.selection;
                let lineRange = [selection.start.line, selection.end.line];
                let lineMin = Math.min.apply(this, lineRange);
                let lineMax = Math.max.apply(this, lineRange);
                if (selection.start.character > 0) {
                    lineMin++;
                }
                if (selection.end.character < vscode.window.activeTextEditor.document.lineAt(selection.end).range.end.character) {
                    lineMax--;
                }
                if (lineMin <= lineMax) {
                    for (let i = lineMin; i <= lineMax; i++) {
                        const invalidKeys = [];
                        for (let [key, bm] of bms) {
                            if (bm.line === i) {
                                invalidKeys.push(key);
                                updatedBookmark = true;
                            }
                        }
                        invalidKeys.forEach((key) => bms.delete(key));
                    }
                }
            }
        }
        else if (event.contentChanges.length === 2) {
            // move line up and move line down case
            if (vscode.window.activeTextEditor.selections.length === 1) {
                if (event.contentChanges[0].text === "") {
                    updatedBookmark = this.moveStickyBookmarks("down");
                }
                else if (event.contentChanges[1].text === "") {
                    updatedBookmark = this.moveStickyBookmarks("up");
                }
            }
        }
        return updatedBookmark;
    }
    HadOnlyOneValidContentChange(event) {
        const length = event.contentChanges.length;
        const range = event.contentChanges[0].range;
        // not valid
        if ((length > 2) || (length === 0)) {
            return false;
        }
        // normal behavior - only 1
        if (length === 1) {
            return true;
        }
        else { // has 2, but is it a trimAutoWhitespace issue?
            if (length === 2) {
                // check if the first range is 'equal' and if the second is 'empty', do trim
                let fistRangeEquals = (range.start.character === range.end.character) &&
                    (range.start.line === range.end.line);
                let secondRangeEmpty = (event.contentChanges[1].text === "") &&
                    (event.contentChanges[1].range.start.line === event.contentChanges[1].range.end.line) &&
                    (event.contentChanges[1].range.start.character === 0) &&
                    (event.contentChanges[1].range.end.character > 0);
                return fistRangeEquals && secondRangeEmpty;
            }
        }
    }
}
exports.StickyBookmark = StickyBookmark;


/***/ }),

/***/ "./src/bookmark/storage.ts":
/*!*********************************!*\
  !*** ./src/bookmark/storage.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(/*! path */ "path");
const fs = __webpack_require__(/*! fs */ "fs");
const vscode = __webpack_require__(/*! vscode */ "vscode");
const bookmark_1 = __webpack_require__(/*! ./model/bookmark */ "./src/bookmark/model/bookmark.ts");
const document_1 = __webpack_require__(/*! ./model/document */ "./src/bookmark/model/document.ts");
const manager_1 = __webpack_require__(/*! ./manager */ "./src/bookmark/manager.ts");
const history_1 = __webpack_require__(/*! ./model/history */ "./src/bookmark/model/history.ts");
class Storage {
    constructor(config, context, manager) {
        this.config = config;
        this.context = context;
        this.manager = manager;
        this.load = () => {
            if (vscode.workspace.rootPath && this.config.saveBookmarksInProject) {
                let fPath = path.join(vscode.workspace.rootPath, ".vscode", "metago_bookmarks.json");
                if (!fs.existsSync(fPath)) {
                    return false;
                }
                try {
                    let str = fs.readFileSync(fPath).toString();
                    this.updateManagerData(JSON.parse(str));
                    return true;
                }
                catch (error) {
                    vscode.window.showErrorMessage("Error loading Bookmarks: " + error.toString());
                    return false;
                }
            }
            else {
                let savedBookmarks = this.context.workspaceState.get("metago_bookmarks", "");
                if (savedBookmarks !== "") {
                    this.updateManagerData(JSON.parse(savedBookmarks));
                }
                return savedBookmarks !== "";
            }
        };
        this.save = () => __awaiter(this, void 0, void 0, function* () {
            if (this.manager.documents.size === 0) {
                return;
            }
            if (vscode.workspace.rootPath && this.config.saveBookmarksInProject) {
                let fPath = path.join(vscode.workspace.rootPath, ".vscode", "metago_bookmarks.json");
                if (!fs.existsSync(path.dirname(fPath))) {
                    fs.mkdirSync(path.dirname(fPath));
                }
                const manager = yield this.getManagerToSave();
                let str = JSON.stringify(manager, null, "    ");
                //let root = JSON.stringify(vscode.workspace.rootPath).replace(/"/g, '').replace(/\\/g, '\\\\')
                //str = str.replace(new RegExp(root, 'gm'), "$ROOTPATH$");
                fs.writeFileSync(fPath, str);
            }
            else {
                this.context.workspaceState.update("metago_bookmarks", JSON.stringify(yield this.getManagerToSave()));
            }
        });
        this.updateManagerData = (jsonObject) => {
            if (jsonObject === "") {
                return;
            }
            let jsonBookmarks = jsonObject.documents;
            for (let key in jsonBookmarks) {
                const docKey = key.replace("$ROOTPATH$", vscode.workspace.rootPath);
                const doc = this.manager.addDocumentIfNotExist(docKey);
                for (let bmKey in jsonBookmarks[key].bookmarks) {
                    const bm = jsonBookmarks[key].bookmarks[bmKey];
                    doc.addBookmark(new bookmark_1.Bookmark(bm.line, bm.char));
                }
            }
            this.manager.history.history.length = 0;
            jsonObject.history.history.forEach((item) => {
                const docKey = item.documentKey.replace('$ROOTPATH$', vscode.workspace.rootPath);
                this.manager.history.history.push(new history_1.HistoryItem(docKey, item.bookmarkKey));
            });
            this.manager.history.index = Math.min(jsonObject.history.index, this.manager.history.history.length - 1);
        };
        this.getManagerToSave = () => __awaiter(this, void 0, void 0, function* () {
            yield this.manager.tidyBookmarks();
            let managerToSave = new manager_1.BookmarkManager();
            for (let [docKey, doc] of this.manager.documents) {
                const key = docKey.replace(vscode.workspace.rootPath, '$ROOTPATH$');
                let newDoc = new document_1.Document(key, undefined);
                managerToSave.documents[key] = newDoc;
                for (let [bmKey, bm] of doc.bookmarks) {
                    newDoc.bookmarks[bmKey] = new bookmark_1.Bookmark(bm.line, bm.char);
                }
            }
            managerToSave.history.index = this.manager.history.index;
            this.manager.history.history.forEach(item => {
                const docKey = item.documentKey.replace(vscode.workspace.rootPath, '$ROOTPATH$');
                managerToSave.history.history.push(new history_1.HistoryItem(docKey, item.bookmarkKey));
            });
            return managerToSave;
        });
    }
}
exports.Storage = Storage;


/***/ }),

/***/ "./src/bracket-jumper.ts":
/*!*******************************!*\
  !*** ./src/bracket-jumper.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const lib_1 = __webpack_require__(/*! ./lib */ "./src/lib/index.ts");
class bracket {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.counter = 0;
    }
}
class BracketJumper {
    constructor(context) {
        this.bracketPairs = [new bracket('[', ']'), new bracket('{', '}'), new bracket('(', ')')];
        let disposable = vscode.commands.registerCommand('metaGo.jumpToBracket', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            let fromLine = editor.selection.active.line;
            let fromChar = editor.selection.active.character;
            let line = editor.document.lineAt(fromLine);
            this.clearBracketsCounter();
            if (this.isBracket(line.text[fromChar]) || this.isBracket(line.text[fromChar - 1])) {
                vscode.commands.executeCommand('editor.action.jumpToBracket');
                return;
            }
            if (this.testLine(line, fromChar))
                return;
            while (--fromLine >= 0) {
                let line = editor.document.lineAt(fromLine);
                if (this.testLine(line))
                    return;
            }
        });
        context.subscriptions.push(disposable);
    }
    testLine(line, tillIndex = -1) {
        if (tillIndex === -1) {
            tillIndex = line.text.length;
        }
        let editor = vscode.window.activeTextEditor;
        for (let i = tillIndex - 1; i >= line.firstNonWhitespaceCharacterIndex; --i) {
            let char = line.text[i];
            let index = -1;
            if (this.bracketPairs.some((c, i) => { index = i; return c.end === char; })) {
                this.bracketPairs[index].counter++;
            }
            else if (this.bracketPairs.some((c, i) => { index = i; return c.start === char; })) {
                if (this.bracketPairs[index].counter === 0) {
                    let lineN = line.lineNumber;
                    lib_1.Utilities.goto(editor, lineN, i);
                    let position = new vscode.Position(lineN, i);
                    let range = new vscode.Range(position, position);
                    vscode.window.activeTextEditor.revealRange(range);
                    return true;
                }
                this.bracketPairs[index].counter--;
            }
        }
        return false;
    }
    isBracket(char) {
        return this.bracketPairs.some((c) => c.start === char || c.end === char);
    }
    isBracketStart(char) {
        return this.bracketPairs.some((c) => c.start === char);
    }
    isBracketEnd(char) {
        return this.bracketPairs.some((c, i) => c.end === char);
    }
    clearBracketsCounter() {
        this.bracketPairs.forEach((c) => c.counter = 0);
    }
}
exports.BracketJumper = BracketJumper;


/***/ }),

/***/ "./src/config.ts":
/*!***********************!*\
  !*** ./src/config.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const config_1 = __webpack_require__(/*! ./bookmark/config */ "./src/bookmark/config.ts");
class Config {
    constructor() {
        this.decoration = new DecoratorConfig();
        this.jumper = new FinderConfig();
        this.bookmark = new config_1.BookmarkConfig();
        this.loadConfig = () => {
            try {
                this.bookmark.loadConfig();
                let config = vscode.workspace.getConfiguration("metaGo");
                this.decoration.useTextBasedDecorations = config.get("decoration.useTextBasedDecorations", this.decoration.useTextBasedDecorations);
                this.decoration.bgColor = config.get("decoration.backgroundColor", this.decoration.bgColor);
                this.decoration.bgOpacity = config.get("decoration.backgroundOpacity", this.decoration.bgOpacity);
                this.decoration.color = config.get("decoration.color", this.decoration.color);
                this.decoration.borderColor = config.get("decoration.borderColor", this.decoration.borderColor);
                this.decoration.matchBackground = config.get("decoration.matchBackground", this.decoration.matchBackground);
                this.decoration.targetFollowCharBackground = config.get("decoration.targetFollowCharBackground", this.decoration.targetFollowCharBackground);
                this.decoration.width = config.get("decoration.width", this.decoration.width);
                this.decoration.height = config.get("decoration.height", this.decoration.height);
                this.decoration.x = config.get("decoration.x", this.decoration.x);
                this.decoration.y = config.get("decoration.y", this.decoration.y);
                this.decoration.fontSize = config.get("decoration.fontSize", this.decoration.fontSize);
                this.decoration.fontWeight = config.get("decoration.fontWeight", this.decoration.fontWeight);
                this.decoration.fontFamily = config.get("decoration.fontFamily", this.decoration.fontFamily);
                this.jumper.characters = config.get("decoration.characters", "k, j, d, f, l, s, a, h, g, i, o, n, u, r, v, c, w, e, x, m, b, p, q, t, y, z").split(/[\s,]+/);
                this.jumper.additionalSingleCharCodeCharacters = config.get("decoration.additionalSingleCharCodeCharacters", "J,D,F,L,A,H,G,I,N,R,E,M,B,Q,T,Y").split(/[\s,]+/);
                this.decoration.hide.trigerKey = config.get('decoration.hide.trigerKey');
                this.decoration.hide.triggerKeyDownRepeatInitialDelay = config.get('decoration.hide.triggerKeyDownRepeatInitialDelay');
                this.decoration.hide.triggerKeyDownRepeatInterval = config.get('decoration.hide.triggerKeyDownRepeatInterval');
                this.jumper.findAllMode = config.get("jumper.findAllMode", this.jumper.findAllMode);
                this.jumper.findInSelection = config.get("jumper.findInSelection", this.jumper.findInSelection);
                this.jumper.wordSeparatorPattern = config.get("jumper.wordSeparatorPattern", this.jumper.wordSeparatorPattern);
                let timeout = config.get("jumper.timeout", this.jumper.timeout);
                this.jumper.timeout = isNaN(timeout) ? 12000 : timeout * 1000;
            }
            catch (e) {
                vscode.window.showErrorMessage('metaGo: please double check your metaGo config->' + e);
            }
        };
    }
}
exports.Config = Config;
class DecoratorHide {
    constructor() {
        this.trigerKey = '/';
        this.triggerKeyDownRepeatInitialDelay = 550;
        this.triggerKeyDownRepeatInterval = 60;
    }
}
class DecoratorConfig {
    constructor() {
        this.useTextBasedDecorations = false;
        this.bgOpacity = '0.8';
        this.bgColor = "lime,yellow";
        this.color = "black";
        this.borderColor = "black";
        this.width = 12;
        this.height = 14;
        this.x = 2;
        this.y = 12;
        this.fontSize = 14;
        this.matchBackground = "editor.wordHighlightBackground";
        this.targetFollowCharBackground = "#4169E1";
        this.fontWeight = "normal";
        this.fontFamily = "Consolas";
        this.hide = new DecoratorHide();
    }
}
class FinderConfig {
    constructor() {
        this.findAllMode = 'on';
        this.findInSelection = 'off';
        this.wordSeparatorPattern = "[ ,-.{_(\"'<\\/[+]";
        this.timeout = 12000;
    }
}


/***/ }),

/***/ "./src/current-line-scroller.ts":
/*!**************************************!*\
  !*** ./src/current-line-scroller.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const viewport_1 = __webpack_require__(/*! ./lib/viewport */ "./src/lib/viewport.ts");
// todo: test revealLine command: 
// https://code.visualstudio.com/api/references/commands
class CurrentLineScroller {
    constructor(context) {
        this._viewPort = new viewport_1.ViewPort();
        let disposable = vscode.commands.registerCommand('metaGo.scrollCurrentLineToMiddle', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        });
        context.subscriptions.push(disposable);
        let disposableToTop = vscode.commands.registerCommand('metaGo.scrollCurrentLineToTop', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
        });
        context.subscriptions.push(disposableToTop);
        let disposableToBottom = vscode.commands.registerCommand('metaGo.scrollCurrentLineToBottom', () => __awaiter(this, void 0, void 0, function* () {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            let currentLine = selection.active.line;
            yield vscode.commands.executeCommand("revealLine", {
                at: 'bottom',
                lineNumber: currentLine
            });
            // bellow is another way to caculate the bottom(note: not support fold):(not used because we have internal command revealLine.bottom)
            // let boundary = await this._viewPort.getViewPortBoundary(editor);// not support folder
            // let line = currentLine - Math.trunc(boundary / 2);
            // line = Math.max(0, line);
            // let p = new vscode.Position(line, 0)
            // const range = new vscode.Range(p, p);
            // editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        }));
        context.subscriptions.push(disposableToBottom);
    }
}
exports.CurrentLineScroller = CurrentLineScroller;


/***/ }),

/***/ "./src/extension.ts":
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(/*! vscode */ "vscode");
const config_1 = __webpack_require__(/*! ./config */ "./src/config.ts");
const metajumper_1 = __webpack_require__(/*! ./metajumper */ "./src/metajumper/index.ts");
const current_line_scroller_1 = __webpack_require__(/*! ./current-line-scroller */ "./src/current-line-scroller.ts");
const blank_line_jumper_1 = __webpack_require__(/*! ./blank-line-jumper */ "./src/blank-line-jumper.ts");
const select_lines_1 = __webpack_require__(/*! ./select-lines */ "./src/select-lines.ts");
const bookmark_1 = __webpack_require__(/*! ./bookmark */ "./src/bookmark/index.ts");
const bracket_jumper_1 = __webpack_require__(/*! ./bracket-jumper */ "./src/bracket-jumper.ts");
const landing_page_1 = __webpack_require__(/*! ./landing-page */ "./src/landing-page/index.ts");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const landingPage = new landing_page_1.LandingPage(context);
    landingPage.showIfNeed();
    // console.log('Congratulations, your extension "metago" is now active!');
    let config = new config_1.Config();
    config.loadConfig();
    // Event to update active configuration items when changed without restarting vscode
    vscode.workspace.onDidChangeConfiguration(e => {
        config.loadConfig();
        metaJumper.updateConfig();
    });
    // let editorConfig =vscode.workspace.getConfiguration("editor")
    // let fontSize =editorConfig.inspect("fontSize")
    // let fontfamily =editorConfig.inspect("fontFamily")
    //let lineHight = editorConfig.inspect("lineHeight")
    let metaJumper = new metajumper_1.MetaJumper(context, config);
    let centerEditor = new current_line_scroller_1.CurrentLineScroller(context);
    let spaceBlockJumper = new blank_line_jumper_1.BlankLineJumper(context);
    let selectLineUp = new select_lines_1.SelectLines(context);
    let bookmark = new bookmark_1.BookmarkExt(context, config.bookmark);
    let bracketJumper = new bracket_jumper_1.BracketJumper(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;


/***/ }),

/***/ "./src/landing-page/changelog.ts":
/*!***************************************!*\
  !*** ./src/landing-page/changelog.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const contentProvider_1 = __webpack_require__(/*! ./contentProvider */ "./src/landing-page/contentProvider.ts");
exports.changeLog = [
    { kind: contentProvider_1.ChangeLogKind.ADDED, message: `metaJump: ripple support, type location-chars to triger far from center: one char current paragraph(seperated by empty lines); two chars current doc; three chars all opened editors; for one and two target chars, one char decorators will pass through boundaries if possible(i.e. for one target char, no two chars decorators are needed for all candidates in the current paragraph)` },
    { kind: contentProvider_1.ChangeLogKind.ADDED, message: `metaJump: target chars is only used for narrow down searching range, not for navagition. solve the problem of typing muti target chars together may edit document by mistake` },
    { kind: contentProvider_1.ChangeLogKind.ADDED, message: `metaGo: what's new page to show when major and minor upgrade` },
    { kind: contentProvider_1.ChangeLogKind.ADDED, message: `dev: webpack support bundle third party packates` },
    { kind: contentProvider_1.ChangeLogKind.CHANGED, message: `bookmark: one bookmark in one line, toggle-bookmark command works when cursor not at char location. char location is still used when goto the bookmark.` },
    { kind: contentProvider_1.ChangeLogKind.CHANGED, message: `line selection: metaGo.selectLineUp default shortcut changed from ctrl+shift+l to ctrl+i, to avoid collision with default command of ctrl+shift+l.` },
    { kind: contentProvider_1.ChangeLogKind.FIXED, message: `bookmark: type in popup box, would jump automaticly, may edit when type fast. should only do filter!` },
    { kind: contentProvider_1.ChangeLogKind.FIXED, message: `metaJump: fix cancel exception: after tigger jump, then press Esc would throw exception.` },
];


/***/ }),

/***/ "./src/landing-page/contentProvider.ts":
/*!*********************************************!*\
  !*** ./src/landing-page/contentProvider.ts ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var ChangeLogKind;
(function (ChangeLogKind) {
    ChangeLogKind["ADDED"] = "ADDED";
    ChangeLogKind["REMOVED"] = "REMOVED";
    ChangeLogKind["CHANGED"] = "CHANGED";
    ChangeLogKind["FIXED"] = "FIXED";
})(ChangeLogKind = exports.ChangeLogKind || (exports.ChangeLogKind = {}));
;


/***/ }),

/***/ "./src/landing-page/index.ts":
/*!***********************************!*\
  !*** ./src/landing-page/index.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = __webpack_require__(/*! ./manager */ "./src/landing-page/manager.ts");
const vscode = __webpack_require__(/*! vscode */ "vscode");
const changelog_1 = __webpack_require__(/*! ./changelog */ "./src/landing-page/changelog.ts");
class LandingPage {
    constructor(context) {
        this.viewer = new manager_1.LandingPageManager(context).registerContentProvider("metaGo", this);
        context.subscriptions.push(vscode.commands.registerCommand("metago.showLandingPage", () => this.viewer.showPage()));
    }
    showIfNeed() {
        this.viewer.showPageInActivation();
    }
    provideSponsors() {
        const sponsors = [];
        return sponsors;
    }
    provideHeader(logoUrl) {
        return {
            logo: { src: logoUrl, height: 50, width: 50 },
            message: `<b>MetaGo</b> comes from the voice in my heart💖as a programmer. <i>Metago</i> tries its best to be the coolest😎 keyboard(mouseless) focused navigation tool in vscode. <i>Metago</i> tries to make your keyboard⌨ to you as meaningful as a kitchen knife to a masterchef👩‍🍳.`
        };
    }
    provideChangeLog() {
        return changelog_1.changeLog;
    }
}
exports.LandingPage = LandingPage;


/***/ }),

/***/ "./src/landing-page/manager.ts":
/*!*************************************!*\
  !*** ./src/landing-page/manager.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const path = __webpack_require__(/*! path */ "path");
const semver = __webpack_require__(/*! semver */ "./node_modules/semver/index.js");
const vscode = __webpack_require__(/*! vscode */ "vscode");
const pageBuilder_1 = __webpack_require__(/*! ./pageBuilder */ "./src/landing-page/pageBuilder.ts");
class LandingPageManager {
    constructor(context) {
        this.context = context;
    }
    registerContentProvider(extensionName, contentProvider) {
        this.extensionName = extensionName;
        this.contentProvider = contentProvider;
        return this;
    }
    showPageInActivation() {
        this.extension = vscode.extensions.getExtension(`metaseed.${this.extensionName}`);
        const previousExtensionVersion = this.context.globalState.get(`${this.extensionName}.version`);
        this.showPageIfVersionDiffers(this.extension.packageJSON.version, previousExtensionVersion);
    }
    showPage() {
        const panel = vscode.window.createWebviewPanel(`${this.extensionName}.whatsNew`, `What's New in ${this.extension.packageJSON.displayName}`, vscode.ViewColumn.One, { enableScripts: true });
        // Get path to resource on disk
        const onDiskPath = vscode.Uri.file(path.join(this.context.extensionPath, 'ui', "landing-page", "whats-new.html"));
        const pageUri = onDiskPath.with({ scheme: "vscode-resource" });
        // Local path to main script run in the webview
        const cssPathOnDisk = vscode.Uri.file(path.join(this.context.extensionPath, 'ui', "landing-page", "main.css"));
        const cssUri = cssPathOnDisk.with({ scheme: "vscode-resource" });
        // Local path to main script run in the webview
        const logoPathOnDisk = vscode.Uri.file(path.join(this.context.extensionPath, "images", `metago.gif`));
        const logoUri = logoPathOnDisk.with({ scheme: "vscode-resource" });
        panel.webview.html = this.getWebviewContentLocal(pageUri.fsPath, cssUri.toString(), logoUri.toString());
    }
    showPageIfVersionDiffers(currentVersion, previousVersion) {
        if (previousVersion) {
            const differs = semver.diff(currentVersion, previousVersion);
            // only "patch" should be suppressed
            if (!differs || differs === "patch") {
                return;
            }
        }
        // "major", "minor"
        this.context.globalState.update(`${this.extensionName}.version`, currentVersion);
        this.showPage();
    }
    getWebviewContentLocal(htmlFile, cssUrl, logoUrl) {
        return new pageBuilder_1.LandingPageBuilder(htmlFile)
            .updateExtensionDisplayName(this.extension.packageJSON.displayName)
            .updateExtensionName(this.extensionName)
            .updateExtensionVersion(this.extension.packageJSON.version)
            .updateRepositoryUrl(this.extension.packageJSON.repository.url.slice(0, this.extension.packageJSON.repository.url.length - 4))
            .updateRepositoryIssues(this.extension.packageJSON.bugs.url)
            .updateRepositoryHomepage(this.extension.packageJSON.homepage)
            .updateCSS(cssUrl)
            .updateHeader(this.contentProvider.provideHeader(logoUrl))
            .updateChangeLog(this.contentProvider.provideChangeLog())
            .updateSponsors(this.contentProvider.provideSponsors())
            .build();
    }
}
exports.LandingPageManager = LandingPageManager;


/***/ }),

/***/ "./src/landing-page/pageBuilder.ts":
/*!*****************************************!*\
  !*** ./src/landing-page/pageBuilder.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs = __webpack_require__(/*! fs */ "fs");
const contentProvider_1 = __webpack_require__(/*! ./contentProvider */ "./src/landing-page/contentProvider.ts");
class LandingPageBuilder {
    constructor(htmlFile) {
        this.htmlFile = fs.readFileSync(htmlFile).toString();
    }
    updateExtensionDisplayName(extensionDisplayName) {
        this.htmlFile = this.htmlFile.replace(/\$\{extensionDisplayName\}/g, extensionDisplayName);
        return this;
    }
    updateExtensionName(extensionName) {
        this.htmlFile = this.htmlFile.replace(/\$\{extensionName\}/g, extensionName);
        return this;
    }
    updateExtensionVersion(extensionVersion) {
        this.htmlFile = this.htmlFile.replace("${extensionVersion}", extensionVersion); //.slice(0, extensionVersion.lastIndexOf(".")));
        return this;
    }
    updateRepositoryUrl(repositoryUrl) {
        this.htmlFile = this.htmlFile.replace(/\$\{repositoryUrl\}/g, repositoryUrl);
        return this;
    }
    updateRepositoryIssues(repositoryIssues) {
        this.htmlFile = this.htmlFile.replace("${repositoryIssues}", repositoryIssues);
        return this;
    }
    updateRepositoryHomepage(repositoryHomepage) {
        this.htmlFile = this.htmlFile.replace("${repositoryHomepage}", repositoryHomepage);
        return this;
    }
    updateCSS(cssUrl) {
        this.htmlFile = this.htmlFile.replace("${cssUrl}", cssUrl);
        return this;
    }
    updateHeader(header) {
        this.htmlFile = this.htmlFile.replace("${headerLogo}", header.logo.src);
        this.htmlFile = this.htmlFile.replace("${headerWidth}", header.logo.width.toString());
        this.htmlFile = this.htmlFile.replace("${headerHeight}", header.logo.height.toString());
        this.htmlFile = this.htmlFile.replace("${headerMessage}", header.message);
        return this;
    }
    updateChangeLog(changeLog) {
        let changeLogString = "";
        for (const cl of changeLog) {
            const badge = this.getBadgeFromChangeLogKind(cl.kind);
            changeLogString = changeLogString.concat(`<li><span class="changelog__badge changelog__badge--${badge}">${cl.kind}</span>
                    ${cl.message}
                </li>`);
        }
        this.htmlFile = this.htmlFile.replace("${changeLog}", changeLogString);
        return this;
    }
    updateSponsors(sponsors) {
        if (sponsors.length === 0) {
            this.htmlFile = this.htmlFile.replace("${sponsors}", "");
            return this;
        }
        let sponsorsString = `<p>
          <h2>Sponsors</h2>`;
        for (const sp of sponsors) {
            sponsorsString = sponsorsString.concat(`<a title="${sp.title}" href="${sp.link}">
                    <img src="${sp.image}" width="${sp.width}%"/>
                </a>
                ${sp.message} 
                ${sp.extra}`);
        }
        sponsorsString = sponsorsString.concat("</p>");
        this.htmlFile = this.htmlFile.replace("${sponsors}", sponsorsString);
        return this;
    }
    build() {
        return this.htmlFile.toString();
    }
    getBadgeFromChangeLogKind(kind) {
        switch (kind) {
            case contentProvider_1.ChangeLogKind.ADDED:
                return "added";
            case contentProvider_1.ChangeLogKind.CHANGED:
                return "changed";
            case contentProvider_1.ChangeLogKind.FIXED:
                return "fixed";
            case contentProvider_1.ChangeLogKind.REMOVED:
                return "removed";
            default:
                break;
        }
    }
}
exports.LandingPageBuilder = LandingPageBuilder;


/***/ }),

/***/ "./src/lib/color.ts":
/*!**************************!*\
  !*** ./src/lib/color.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
//http://dev.w3.org/csswg/css-color/#named-colors.
const Colors = {
    "aliceblue": [240, 248, 255],
    "antiquewhite": [250, 235, 215],
    "aqua": [0, 255, 255],
    "aquamarine": [127, 255, 212],
    "azure": [240, 255, 255],
    "beige": [245, 245, 220],
    "bisque": [255, 228, 196],
    "black": [0, 0, 0],
    "blanchedalmond": [255, 235, 205],
    "blue": [0, 0, 255],
    "blueviolet": [138, 43, 226],
    "brown": [165, 42, 42],
    "burlywood": [222, 184, 135],
    "cadetblue": [95, 158, 160],
    "chartreuse": [127, 255, 0],
    "chocolate": [210, 105, 30],
    "coral": [255, 127, 80],
    "cornflowerblue": [100, 149, 237],
    "cornsilk": [255, 248, 220],
    "crimson": [220, 20, 60],
    "cyan": [0, 255, 255],
    "darkblue": [0, 0, 139],
    "darkcyan": [0, 139, 139],
    "darkgoldenrod": [184, 134, 11],
    "darkgray": [169, 169, 169],
    "darkgreen": [0, 100, 0],
    "darkgrey": [169, 169, 169],
    "darkkhaki": [189, 183, 107],
    "darkmagenta": [139, 0, 139],
    "darkolivegreen": [85, 107, 47],
    "darkorange": [255, 140, 0],
    "darkorchid": [153, 50, 204],
    "darkred": [139, 0, 0],
    "darksalmon": [233, 150, 122],
    "darkseagreen": [143, 188, 143],
    "darkslateblue": [72, 61, 139],
    "darkslategray": [47, 79, 79],
    "darkslategrey": [47, 79, 79],
    "darkturquoise": [0, 206, 209],
    "darkviolet": [148, 0, 211],
    "deeppink": [255, 20, 147],
    "deepskyblue": [0, 191, 255],
    "dimgray": [105, 105, 105],
    "dimgrey": [105, 105, 105],
    "dodgerblue": [30, 144, 255],
    "firebrick": [178, 34, 34],
    "floralwhite": [255, 250, 240],
    "forestgreen": [34, 139, 34],
    "fuchsia": [255, 0, 255],
    "gainsboro": [220, 220, 220],
    "ghostwhite": [248, 248, 255],
    "gold": [255, 215, 0],
    "goldenrod": [218, 165, 32],
    "gray": [128, 128, 128],
    "green": [0, 128, 0],
    "greenyellow": [173, 255, 47],
    "grey": [128, 128, 128],
    "honeydew": [240, 255, 240],
    "hotpink": [255, 105, 180],
    "indianred": [205, 92, 92],
    "indigo": [75, 0, 130],
    "ivory": [255, 255, 240],
    "khaki": [240, 230, 140],
    "lavender": [230, 230, 250],
    "lavenderblush": [255, 240, 245],
    "lawngreen": [124, 252, 0],
    "lemonchiffon": [255, 250, 205],
    "lightblue": [173, 216, 230],
    "lightcoral": [240, 128, 128],
    "lightcyan": [224, 255, 255],
    "lightgoldenrodyellow": [250, 250, 210],
    "lightgray": [211, 211, 211],
    "lightgreen": [144, 238, 144],
    "lightgrey": [211, 211, 211],
    "lightpink": [255, 182, 193],
    "lightsalmon": [255, 160, 122],
    "lightseagreen": [32, 178, 170],
    "lightskyblue": [135, 206, 250],
    "lightslategray": [119, 136, 153],
    "lightslategrey": [119, 136, 153],
    "lightsteelblue": [176, 196, 222],
    "lightyellow": [255, 255, 224],
    "lime": [0, 255, 0],
    "limegreen": [50, 205, 50],
    "linen": [250, 240, 230],
    "magenta": [255, 0, 255],
    "maroon": [128, 0, 0],
    "mediumaquamarine": [102, 205, 170],
    "mediumblue": [0, 0, 205],
    "mediumorchid": [186, 85, 211],
    "mediumpurple": [147, 112, 219],
    "mediumseagreen": [60, 179, 113],
    "mediumslateblue": [123, 104, 238],
    "mediumspringgreen": [0, 250, 154],
    "mediumturquoise": [72, 209, 204],
    "mediumvioletred": [199, 21, 133],
    "midnightblue": [25, 25, 112],
    "mintcream": [245, 255, 250],
    "mistyrose": [255, 228, 225],
    "moccasin": [255, 228, 181],
    "navajowhite": [255, 222, 173],
    "navy": [0, 0, 128],
    "oldlace": [253, 245, 230],
    "olive": [128, 128, 0],
    "olivedrab": [107, 142, 35],
    "orange": [255, 165, 0],
    "orangered": [255, 69, 0],
    "orchid": [218, 112, 214],
    "palegoldenrod": [238, 232, 170],
    "palegreen": [152, 251, 152],
    "paleturquoise": [175, 238, 238],
    "palevioletred": [219, 112, 147],
    "papayawhip": [255, 239, 213],
    "peachpuff": [255, 218, 185],
    "peru": [205, 133, 63],
    "pink": [255, 192, 203],
    "plum": [221, 160, 221],
    "powderblue": [176, 224, 230],
    "purple": [128, 0, 128],
    "rebeccapurple": [102, 51, 153],
    "red": [255, 0, 0],
    "rosybrown": [188, 143, 143],
    "royalblue": [65, 105, 225],
    "saddlebrown": [139, 69, 19],
    "salmon": [250, 128, 114],
    "sandybrown": [244, 164, 96],
    "seagreen": [46, 139, 87],
    "seashell": [255, 245, 238],
    "sienna": [160, 82, 45],
    "silver": [192, 192, 192],
    "skyblue": [135, 206, 235],
    "slateblue": [106, 90, 205],
    "slategray": [112, 128, 144],
    "slategrey": [112, 128, 144],
    "snow": [255, 250, 250],
    "springgreen": [0, 255, 127],
    "steelblue": [70, 130, 180],
    "tan": [210, 180, 140],
    "teal": [0, 128, 128],
    "thistle": [216, 191, 216],
    "tomato": [255, 99, 71],
    "turquoise": [64, 224, 208],
    "violet": [238, 130, 238],
    "wheat": [245, 222, 179],
    "white": [255, 255, 255],
    "whitesmoke": [245, 245, 245],
    "yellow": [255, 255, 0],
    "yellowgreen": [154, 205, 50]
};
const vscode_1 = __webpack_require__(/*! vscode */ "vscode");
function color(inputColor, opacity = 255) {
    if (/[a-z]+\.[a-z]+/i.test(inputColor) ||
        ['contrastActiveBorder', 'contrastBorder', 'focusBorder', 'foreground', 'descriptionForeground', 'errorForeground'].includes(inputColor)) {
        return new vscode_1.ThemeColor(inputColor);
    }
    else {
        let c = Colors[inputColor];
        if (c)
            return `rgba(${c[0]},${c[1]},${c[2]},${opacity})`;
        if (inputColor.startsWith('#')) {
            let r = parseInt(inputColor.substring(1, 3), 16);
            let g = parseInt(inputColor.substring(3, 5), 16);
            let b = parseInt(inputColor.substring(5, 7), 16);
            let a = parseInt(inputColor.substring(7, 9), 16);
            let ov = Number.isNaN(a) ? opacity : a;
            let o = (ov > 1) ? (ov / 255) : ov;
            return `rgba(${r},${g},${b},${o})`;
        }
        return inputColor;
    }
}
exports.color = color;


/***/ }),

/***/ "./src/lib/cursor.ts":
/*!***************************!*\
  !*** ./src/lib/cursor.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
class Cursor {
    // https://code.visualstudio.com/api/references/commands
    // search
    static toCenter(select = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: 'viewPortCenter',
                select: select
            });
        });
    }
    static toTop(select = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: 'viewPortTop',
                select: select
            });
        });
    }
    static toBottom(select = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: 'viewPortBottom',
                select: select
            });
        });
    }
    static toWrappedLineStart(select = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: 'wrappedLineStart',
                select: select
            });
        });
    }
    static toWrappedLineEnd(select = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: 'wrappedLineEnd',
                select: select
            });
        });
    }
    static toWrappedLineFirstNonWhitespaceCharacter(select = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: 'wrappedLineFirstNonWhitespaceCharacter',
                select: select
            });
        });
    }
    static toWrappedLineLastNonWhitespaceCharacter(select = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: 'wrappedLineLastNonWhitespaceCharacter',
                select: select
            });
        });
    }
    static toWrappedLineColumnCenter(select = false) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode.commands.executeCommand("cursorMove", {
                to: 'wrappedLineColumnCenter',
                select: select
            });
        });
    }
    static to(editor, lineIndex, charIndex) {
        editor.selection = new vscode.Selection(new vscode.Position(lineIndex, charIndex), new vscode.Position(lineIndex, charIndex));
    }
    static locations(editor) {
        return editor.selections;
    }
}
exports.Cursor = Cursor;


/***/ }),

/***/ "./src/lib/index.ts":
/*!**************************!*\
  !*** ./src/lib/index.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./utilities */ "./src/lib/utilities.ts"));


/***/ }),

/***/ "./src/lib/utilities.ts":
/*!******************************!*\
  !*** ./src/lib/utilities.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
class Utilities {
    static goto(editor, line = -1, character = -1) {
        line = line === -1 ? editor.selection.active.line : line;
        character = character === -1 ? editor.selection.active.character : character;
        this.select(editor, line, character, line, character);
    }
    static select(editor, fromLine, fromCharacter, toLine, toCharacter) {
        const startRange = new vscode.Position(fromLine, fromCharacter);
        const endRange = new vscode.Position(toLine, toCharacter);
        editor.selection = new vscode.Selection(startRange, endRange);
        const range = new vscode.Range(startRange, endRange);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        this.focusColumn(editor.viewColumn);
    }
    static focusColumn(i) {
        let exec = vscode.commands.executeCommand;
        if (i === 1)
            exec('workbench.action.focusFirstEditorGroup');
        else if (i === 2)
            exec('workbench.action.focusSecondEditorGroup');
        else if (i === 3)
            exec('workbench.action.focusThirdEditorGroup');
        else if (i === 4)
            exec('workbench.action.focusFourthEditorGroup');
        else if (i === 5)
            exec('workbench.action.focusFifthEditorGroup');
        else if (i === 6)
            exec('workbench.action.focusSixthEditorGroup');
        else if (i === 7)
            exec('workbench.action.focusSeventhEditorGroup');
        else if (i === 8)
            exec('workbench.action.focusEighthEditorGroup');
    }
}
exports.Utilities = Utilities;
Utilities.wait = m => new Promise(r => setTimeout(r, m));


/***/ }),

/***/ "./src/lib/viewport.ts":
/*!*****************************!*\
  !*** ./src/lib/viewport.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const cursor_1 = __webpack_require__(/*! ./cursor */ "./src/lib/cursor.ts");
class ViewPort {
    constructor() {
        this.getVisiableRanges = (editor) => editor.visibleRanges;
        // not support fold
        this.getViewPortBoundary = (editor) => __awaiter(this, void 0, void 0, function* () {
            let fromLine = editor.selection.active.line;
            let fromChar = editor.selection.active.character;
            yield cursor_1.Cursor.toTop();
            let topLine = editor.selection.active.line;
            let bottom = yield cursor_1.Cursor.toBottom();
            let bottomLine = editor.selection.active.line;
            let margin = bottomLine - topLine;
            // back
            editor.selection = new vscode.Selection(new vscode.Position(fromLine, fromChar), new vscode.Position(fromLine, fromChar));
            return margin;
        });
    }
    static viewPortCenter(editor, ranges = null) {
        // when getCenterLineInViewPort exposed to extension we should switch to this api
        //cursor.cursors.primaryCursor.getCenterLineInViewPort();
        ranges = ranges || editor.visibleRanges;
        let lines = ranges.reduce((a, range) => a + range.end.line - range.start.line + 1, 0);
        let half = Math.round(lines / 2);
        for (const r of ranges) {
            let count = r.end.line - r.start.line + 1;
            if (count < half)
                half -= count;
            else {
                return { range: r, line: r.start.line + half - 1 };
            }
        }
    }
}
exports.ViewPort = ViewPort;


/***/ }),

/***/ "./src/metajumper/decoration-model.ts":
/*!********************************************!*\
  !*** ./src/metajumper/decoration-model.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var SmartAdjustment;
(function (SmartAdjustment) {
    SmartAdjustment[SmartAdjustment["Before"] = -1] = "Before";
    SmartAdjustment[SmartAdjustment["Default"] = 0] = "Default"; // default is after
})(SmartAdjustment = exports.SmartAdjustment || (exports.SmartAdjustment = {}));
var Direction;
(function (Direction) {
    Direction[Direction["up"] = -1] = "up";
    Direction[Direction["down"] = 1] = "down";
})(Direction = exports.Direction || (exports.Direction = {}));
class LineCharIndex {
    constructor(line = -1, char = -1, text = "", smartAdj = SmartAdjustment.Default) {
        this.line = line;
        this.char = char;
        this.text = text;
        this.smartAdj = smartAdj;
    }
}
exports.LineCharIndex = LineCharIndex;
LineCharIndex.END = new LineCharIndex();
class DecorationModel extends LineCharIndex {
    constructor(lineCharIndex) {
        super(lineCharIndex.line, lineCharIndex.char, lineCharIndex.text, lineCharIndex.smartAdj);
    }
}
exports.DecorationModel = DecorationModel;
class LineCharIndexState {
    constructor(lineIndexes, firstIndex, count, direction = Direction.up) {
        this.lineIndexes = lineIndexes;
        this.firstIndex = firstIndex;
        this.count = count;
        this.direction = direction;
        this.upIndexCounter = lineIndexes.lowIndexNearFocus - firstIndex;
        this.downIndexCounter = lineIndexes.highIndexNearFocus - firstIndex;
        this.indexes = lineIndexes.indexes.slice(firstIndex, firstIndex + count);
    }
    findNextAutoWrap() {
        let r = this.findNext();
        if (r.lineCharIndex === LineCharIndex.END) {
            this.toggleDirection();
            r = this.findNext();
        }
        if (r.lineChanging)
            this.toggleDirection();
        return r.lineCharIndex;
    }
    toggleDirection() {
        this.direction = this.direction === Direction.up ? Direction.down : Direction.up;
    }
    findNext() {
        if (this.direction === Direction.up) {
            return this.findUp();
        }
        else {
            return this.findDown();
        }
    }
    findUp() {
        if (this.upIndexCounter == -1)
            return { lineCharIndex: LineCharIndex.END, lineChanging: false };
        let lineChanging = this.upIndexCounter > 0 && this.indexes[this.upIndexCounter].line !== this.indexes[this.upIndexCounter - 1].line;
        return { lineCharIndex: this.indexes[this.upIndexCounter--], lineChanging };
    }
    findDown() {
        let len = this.indexes.length;
        if (this.downIndexCounter == -1 || this.downIndexCounter === len)
            return { lineCharIndex: LineCharIndex.END, lineChanging: false };
        let lineChanging = this.downIndexCounter < len - 1 && this.indexes[this.downIndexCounter].line !== this.indexes[this.downIndexCounter + 1].line;
        return { lineCharIndex: this.indexes[this.downIndexCounter++], lineChanging };
    }
}
class DecorationModelBuilder {
    constructor() {
        this.initialize = (config) => {
            this.config = config;
        };
        this.buildDecorationModel = (editorToLineCharIndexesMap, lettersExcluded, enableSequentialTargetChars, targetCharsCount, rippleSupport) => {
            if (editorToLineCharIndexesMap.size === 0)
                throw new Error("metaGo: no open editor");
            let chars = lettersExcluded === null || lettersExcluded.size === 0 ? this.config.jumper.characters : this.config.jumper.characters.filter(c => !lettersExcluded.has(c.toUpperCase()) && !lettersExcluded.has(c.toLowerCase()));
            let signalCharLetters = lettersExcluded === null ? this.config.jumper.additionalSingleCharCodeCharacters : this.config.jumper.additionalSingleCharCodeCharacters.filter(c => !lettersExcluded.has(c));
            let targetCount = 0;
            let all = 0;
            editorToLineCharIndexesMap.forEach(lineCharIndex => all += lineCharIndex.indexes.length);
            targetCount = all;
            let indexParagraph = false;
            let availableOneChars = chars.length + signalCharLetters.length;
            let [[activeEditor, activeLineCharIndexes]] = editorToLineCharIndexesMap; // current active doc
            if (enableSequentialTargetChars && rippleSupport) {
                if (all > availableOneChars) { // if(all <= availableOneChars) targetCount = all;
                    // current paragraphy with more than one decorator chars or all one char decorators
                    if (targetCharsCount === 1) {
                        targetCount = availableOneChars;
                        if (activeLineCharIndexes.firstIndexInParagraph !== -1 && activeLineCharIndexes.lastIndexInParagraphy !== -1) {
                            let countInParagraph = activeLineCharIndexes.lastIndexInParagraphy - activeLineCharIndexes.firstIndexInParagraph + 1;
                            if (countInParagraph > availableOneChars) {
                                targetCount = countInParagraph;
                                indexParagraph = true;
                            }
                        }
                    }
                    // current editor with more than one decorator chars or all one char decorators
                    else if (targetCharsCount === 2 && editorToLineCharIndexesMap.size > 1) {
                        targetCount = availableOneChars;
                        let activeLen = activeLineCharIndexes.indexes.length;
                        if (activeLen >= availableOneChars)
                            targetCount = activeLen;
                    }
                }
            }
            if (targetCount <= 0) {
                throw new Error("metaGo: no target location match for input char");
            }
            let encoder = new Encoder(targetCount, chars, signalCharLetters);
            let editorToModelsMap = new Map();
            let codeOffset = 0;
            let tCount = 0;
            for (let [editor, lineIndexes] of editorToLineCharIndexesMap) {
                let count = lineIndexes.indexes.length;
                if (count === 0)
                    continue;
                let firstIndex = 0;
                if (editor === activeEditor && indexParagraph) {
                    firstIndex = lineIndexes.firstIndexInParagraph;
                    count = lineIndexes.lastIndexInParagraphy - lineIndexes.firstIndexInParagraph + 1;
                }
                let lineIndexesState = new LineCharIndexState(lineIndexes, firstIndex, count, Direction.up);
                let dModels = [];
                for (let i = 0; i < count; i++) {
                    let lineCharIndex = lineIndexesState.findNextAutoWrap();
                    if (lineCharIndex === LineCharIndex.END)
                        break;
                    let code = encoder.getCode(i + codeOffset);
                    let model = new DecorationModel(lineCharIndex);
                    model.code = code;
                    dModels.push(model);
                    tCount++;
                    if (tCount >= targetCount)
                        break;
                }
                editorToModelsMap.set(editor, dModels);
                codeOffset += count;
                if (tCount >= targetCount)
                    break;
            }
            return editorToModelsMap;
        };
    }
}
exports.DecorationModelBuilder = DecorationModelBuilder;
// rules:
// dimension prority: x>y>z;
// if x is full, then add y dimension at first(next)...
// if all units used in high dimension, pick first(next) one in this dimension, and add it's demision then, fill the added demision to the end.
class Encoder {
    constructor(codeCount, letters, additionalFirstDimOnlyLetters = []) {
        this.codeCount = codeCount;
        this.letters = letters;
        this.additionalFirstDimOnlyLetters = additionalFirstDimOnlyLetters;
        let letterCount = letters.length;
        let codeCountRemain = codeCount - additionalFirstDimOnlyLetters.length;
        if (codeCountRemain <= letterCount) {
            this.dimensions = 1; // fix bug: log(1)/log(26) = 0
            this.usedInLowDim = 0;
            this.notUsedInLowDim = 0;
        }
        else {
            this.dimensions = Math.ceil(Math.log(codeCountRemain) / Math.log(letterCount));
            var lowDimCount = Math.pow(letterCount, this.dimensions - 1);
            this.usedInLowDim = Math.ceil((codeCountRemain - lowDimCount) / (this.letters.length - 1));
            this.notUsedInLowDim = lowDimCount - this.usedInLowDim;
        }
    }
    getCodeOfDimension(index, dimensions) {
        var ii = index;
        var len = this.letters.length;
        var code = '';
        do {
            var i = ii % len;
            code = this.letters[i] + code;
            ii = Math.floor(ii / len);
        } while (ii > 0);
        return code.padStart(dimensions, this.letters[0]);
    }
    getCode(index) {
        let singleCodeLetters = this.additionalFirstDimOnlyLetters.length;
        if (this.dimensions === 1) { // a, b, ... then A, B, C
            if (index < this.letters.length)
                return this.getCodeOfDimension(index, this.dimensions);
            return this.additionalFirstDimOnlyLetters[index - this.letters.length];
        }
        else if (this.dimensions === 2) { // 
            if (index < this.notUsedInLowDim) {
                return this.getCodeOfDimension(index + this.usedInLowDim, this.dimensions - 1);
            }
            else if (index < this.notUsedInLowDim + singleCodeLetters) {
                return this.additionalFirstDimOnlyLetters[index - this.notUsedInLowDim];
            }
            return this.getCodeOfDimension(index - (this.notUsedInLowDim + singleCodeLetters), this.dimensions);
        }
        else {
            if (index < singleCodeLetters)
                return this.additionalFirstDimOnlyLetters[index];
            else if (index < this.notUsedInLowDim + singleCodeLetters) {
                return this.getCodeOfDimension(index - singleCodeLetters + this.usedInLowDim, this.dimensions - 1);
            }
            return this.getCodeOfDimension(index - singleCodeLetters - this.notUsedInLowDim, this.dimensions);
        }
    }
}
exports.Encoder = Encoder;


/***/ }),

/***/ "./src/metajumper/decoration.ts":
/*!**************************************!*\
  !*** ./src/metajumper/decoration.ts ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
const color_1 = __webpack_require__(/*! ../lib/color */ "./src/lib/color.ts");
class Decorator {
    constructor() {
        this.decorationTypeCache = {};
        this.initialize = (config) => {
            this.config = config;
            this.updateCache();
            this.commandIndicatorDecorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: 'rgba(255,255,0,0.4)',
                borderWidth: '2px',
                borderStyle: 'solid',
                light: {
                    borderColor: 'rgba(255,255,0,0.8)'
                },
                dark: {
                    borderColor: 'rgba(255,255,0,0.4)'
                }
            });
            this.selectionDecorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: color_1.color(config.decoration.matchBackground)
            });
            this.targetFollowCharDecorationType = vscode.window.createTextEditorDecorationType({
                backgroundColor: color_1.color(config.decoration.targetFollowCharBackground)
            });
        };
        this.addCommandIndicator = (editor) => {
            let line = editor.selection.anchor.line;
            let char = editor.selection.anchor.character;
            let option = [new vscode.Range(line, char, line, char)];
            editor.setDecorations(this.commandIndicatorDecorationType, option);
        };
        this.removeCommandIndicator = (editor) => {
            let locations = [];
            vscode.window.activeTextEditor.setDecorations(this.commandIndicatorDecorationType, locations);
        };
        this.create = (editor, decorationModel, targetChars, enableSequentialTargetChars) => {
            let decorations = [];
            let selectionDecoratoins = [];
            let targetFollowCharDecorations = [];
            decorationModel.forEach(model => {
                let code = model.code;
                let len = code.length;
                let charIndex = model.char;
                if (targetChars[0] === '\n')
                    len = 0;
                else {
                    // no enough space to display the decorator codes
                    if (charIndex + 1 < len) {
                        len = charIndex + 1;
                        code = code.substring(0, len);
                    }
                }
                if (!decorations[len]) {
                    let decorationType = this.createTextEditorDecorationType(len);
                    decorations[len] = [decorationType, []];
                }
                let option = this.createDecorationOptions(model.line, charIndex + 1 /*len: codeToDecoratorLeftAlign; 1: rightAlign */, code);
                decorations[len][1].push(option);
                selectionDecoratoins.push({ range: new vscode.Range(new vscode.Position(model.line, charIndex), new vscode.Position(model.line, charIndex + targetChars.length)) });
                targetFollowCharDecorations.push({ range: new vscode.Range(new vscode.Position(model.line, charIndex + targetChars.length), new vscode.Position(model.line, charIndex + targetChars.length + 1)) });
            });
            if (enableSequentialTargetChars) {
                editor.setDecorations(this.selectionDecorationType, selectionDecoratoins);
                editor.setDecorations(this.targetFollowCharDecorationType, targetFollowCharDecorations);
            }
            decorations.forEach(([type, option]) => editor.setDecorations(type, option));
            return decorations.filter(e => e);
        };
        this.hide = (editor, decorations) => {
            for (var dec of decorations) {
                editor.setDecorations(dec[0], []);
            }
        };
        this.show = (editor, decorations) => {
            for (var dec of decorations) {
                editor.setDecorations(dec[0], dec[1]);
            }
        };
        this.remove = (editor, enableSequentialTargetChars) => {
            for (var codeLen in this.decorationTypeCache) {
                if (this.decorationTypeCache[codeLen] === null)
                    continue;
                editor.setDecorations(this.decorationTypeCache[codeLen], []);
                this.decorationTypeCache[codeLen].dispose();
                this.decorationTypeCache[codeLen] = null;
            }
            if (enableSequentialTargetChars) {
                editor.setDecorations(this.selectionDecorationType, []);
                editor.setDecorations(this.targetFollowCharDecorationType, []);
            }
        };
        this.createTextEditorDecorationType = (len) => {
            let decorationType = this.decorationTypeCache[len];
            if (decorationType)
                return decorationType;
            let cf = this.config.decoration;
            decorationType = vscode.window.createTextEditorDecorationType({
                after: {
                    margin: `0 0 0 ${len * (-cf.width)}px`,
                }
            });
            this.decorationTypeCache[len] = decorationType;
            return decorationType;
        };
        this.createDecorationOptions = (line, decoratorPosition, code) => {
            const renderOptions = this.getAfterRenderOptions(code);
            return {
                range: new vscode.Range(line, decoratorPosition, line, decoratorPosition),
                renderOptions: {
                    dark: {
                        after: renderOptions,
                    },
                    light: {
                        after: renderOptions,
                    },
                }
            };
        };
        this.getAfterRenderOptions = (code) => {
            if (this.renderOptionsCache[code] !== undefined)
                return this.renderOptionsCache[code];
            this.renderOptionsCache[code] = this.buildAfterRenderOptions(code);
            return this.renderOptionsCache[code];
        };
        this.updateCache = () => {
            this.renderOptionsCache = {};
            this.config.jumper.characters
                .forEach(code => this.renderOptionsCache[code] = this.buildAfterRenderOptions(code));
        };
        this.buildAfterRenderOptions = (code) => {
            return this.config.decoration.useTextBasedDecorations
                ? this.buildAfterRenderOptionsText(code)
                : this.buildAfterRenderOptionsSvg(code);
        };
        this.buildAfterRenderOptionsText = (code) => {
            let cf = this.config.decoration;
            let key = code;
            let colors = cf.bgColor.split(',');
            let bgColor = colors[(code.length - 1) % colors.length];
            let bg = color_1.color(bgColor, +cf.bgOpacity);
            let width = code.length * cf.width;
            let borderColor = color_1.color(cf.borderColor, +cf.bgOpacity);
            return {
                contentText: key,
                backgroundColor: bg,
                fontWeight: cf.fontWeight,
                color: color_1.color(cf.color),
                width: `${width}px`,
                borderStyle: "none none none solid",
                border: `1px ${borderColor}` // cause vertical flash 1px
            };
        };
        this.buildAfterRenderOptionsSvg = (code) => {
            let cf = this.config.decoration;
            let key = code;
            let width = code.length * cf.width;
            let colors = cf.bgColor.split(',');
            let ftColor = cf.color;
            ftColor = this.svgStyleColor(ftColor);
            let bgColor = colors[(code.length - 1) % colors.length];
            bgColor = this.svgStyleColor(bgColor);
            let borderColor = this.svgStyleColor(cf.borderColor);
            let svg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${cf.height}" height="${cf.height}" width="${width}"><rect width="${width}" height="${cf.height}" rx="2" ry="2" style="fill:${bgColor};fill-opacity:${cf.bgOpacity};stroke:${borderColor};stroke-opacity:${cf.bgOpacity};"/><text font-family="${cf.fontFamily}" font-weight="${cf.fontWeight}" font-size="${cf.fontSize}px" style="fill:${ftColor}" x="${cf.x}" y="${cf.y}">${key}</text></svg>`;
            return {
                contentIconPath: vscode.Uri.parse(svg)
            };
        };
    }
    createAll(editorToModelMap, targetChars, enableSequentialTargetChars) {
        let editorToDecorationsMap = new Map();
        editorToModelMap.forEach((model, editor) => {
            let decorations = this.create(editor, model, targetChars, enableSequentialTargetChars);
            editorToDecorationsMap.set(editor, decorations);
        });
        return editorToDecorationsMap;
    }
    hideAll(editorToModelMap) {
        editorToModelMap.forEach((model, editor) => this.hide(editor, model));
    }
    showAll(editorToModelMap) {
        editorToModelMap.forEach((model, editor) => this.show(editor, model));
    }
    removeAll(editorToModelMap, enableSequentialTargetChars) {
        editorToModelMap.forEach((_, editor) => this.remove(editor, enableSequentialTargetChars));
    }
    svgStyleColor(color) {
        if (color.startsWith('#')) {
            let r = parseInt(color.substring(1, 3), 16);
            let g = parseInt(color.substring(3, 5), 16);
            let b = parseInt(color.substring(5, 7), 16);
            return `rgb(${r},${g},${b})`;
        }
        return color;
    }
}
exports.Decorator = Decorator;


/***/ }),

/***/ "./src/metajumper/index.ts":
/*!*********************************!*\
  !*** ./src/metajumper/index.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = __webpack_require__(/*! ../lib */ "./src/lib/index.ts");
const input_1 = __webpack_require__(/*! ./input */ "./src/metajumper/input.ts");
const decoration_model_1 = __webpack_require__(/*! ./decoration-model */ "./src/metajumper/decoration-model.ts");
const decoration_1 = __webpack_require__(/*! ./decoration */ "./src/metajumper/decoration.ts");
const viewport_1 = __webpack_require__(/*! ../lib/viewport */ "./src/lib/viewport.ts");
const vscode = __webpack_require__(/*! vscode */ "vscode");
class Selection {
}
Selection.Empty = new Selection();
var JumpPosition;
(function (JumpPosition) {
    JumpPosition[JumpPosition["Before"] = 0] = "Before";
    JumpPosition[JumpPosition["After"] = 1] = "After";
    JumpPosition[JumpPosition["Smart"] = 2] = "Smart";
})(JumpPosition || (JumpPosition = {}));
class MetaJumper {
    constructor(context, config) {
        this.decorationModelBuilder = new decoration_model_1.DecorationModelBuilder();
        this.decorator = new decoration_1.Decorator();
        this.isJumping = false;
        this.targetChars = "";
        this.currentCommand = "";
        this.doJump = (command, fromStart = true) => {
            if (fromStart)
                this.targetChars = '';
            this.currentCommand = command;
            switch (command) {
                case 'metaGo.gotoAfter':
                    this.jumpTo(JumpPosition.After);
                    break;
                case 'metaGo.gotoSmart':
                    this.jumpTo(JumpPosition.Smart);
                    break;
                case 'metaGo.gotoBefore':
                    this.jumpTo(JumpPosition.Before);
                    break;
                case 'metaGo.gotoAfterActive':
                    this.jumpTo(JumpPosition.After, false);
                    break;
                case 'metaGo.gotoSmartActive':
                    this.jumpTo(JumpPosition.Smart, false);
                    break;
                case 'metaGo.gotoBeforeActive':
                    this.jumpTo(JumpPosition.Before, false);
                    break;
                case 'metaGo.selectSmart':
                    this.selectTo(JumpPosition.Smart);
                    break;
                case 'metaGo.selectBefore':
                    this.selectTo(JumpPosition.Before);
                    break;
                case 'metaGo.selectAfter':
                    this.selectTo(JumpPosition.After);
                    break;
            }
        };
        this.stepCancel = () => {
            let len = this.targetChars.length;
            if (len === 0) {
                this.cancel();
                vscode.commands.executeCommand('setContext', "metaGoJumping", false);
            }
            else {
                let target = this.targetChars.substr(0, this.targetChars.length - 1);
                this.cancel();
                this.targetChars = target;
                this.doJump(this.currentCommand, false);
            }
        };
        this.updateConfig = () => {
            this.decorator.initialize(this.config);
        };
        this.jumpTimeoutId = null;
        this.getTargetChar = (editor) => {
            let result = new input_1.Input(this.config)
                .input(editor, (v) => {
                this.decorator.removeCommandIndicator(editor);
                return v;
            });
            return result;
        };
        this.find = (editor, ranges, targetChars) => {
            if (ranges.length === 0)
                return;
            let { document, selection } = editor;
            let line = selection.active.line;
            let char = selection.active.character;
            if (selection.active.line < ranges[0].start.line || selection.active.line > ranges[ranges.length - 1].end.line) {
                line = viewport_1.ViewPort.viewPortCenter(editor, ranges).line;
                char = 0;
            }
            let lineCharIndexes = {
                lowIndexNearFocus: -1,
                highIndexNearFocus: -1,
                indexes: [],
                firstIndexInParagraph: -1,
                lastIndexInParagraphy: -1,
            };
            let followingChars = new Set();
            for (const range of ranges) {
                if (range.isEmpty)
                    continue;
                let start = range.start;
                let end = range.end;
                for (let lineIndex = start.line; lineIndex <= end.line; lineIndex++) {
                    let text;
                    if (range.isSingleLine) {
                        text = document.getText(range);
                    }
                    else {
                        let line = document.lineAt(lineIndex);
                        text = line.text;
                        if (lineIndex === start.line && start.character !== 0) {
                            text = text.substring(range.start.character);
                        }
                        else if (lineIndex === end.line && end.character !== line.range.end.character) {
                            text = text.substring(0, end.character);
                        }
                    }
                    if (text.trim() === '') {
                        if (lineCharIndexes.firstIndexInParagraph < lineCharIndexes.indexes.length && lineIndex < line) {
                            lineCharIndexes.firstIndexInParagraph = lineCharIndexes.indexes.length; // next index
                        }
                        if (lineIndex > line && lineCharIndexes.lastIndexInParagraphy === -1) {
                            lineCharIndexes.lastIndexInParagraphy = lineCharIndexes.indexes.length - 1; // current last item index
                        }
                    }
                    let { indexes, followingChars: followingCharsInLine } = this.indexesOf(lineIndex, text, targetChars);
                    for (const ind of indexes) {
                        lineCharIndexes.indexes.push(ind);
                    }
                    followingCharsInLine.forEach(char => followingChars.add(char));
                }
            }
            this.updateIndexes(line, char, lineCharIndexes);
            return { lineCharIndexes, followingChars };
        };
        this.indexesOf = (line, textInline, targetChars) => {
            let indexes = [];
            let followingChars = new Set();
            if (targetChars && targetChars.length === 0) {
                return { indexes, followingChars };
            }
            if (targetChars[0] === '\n') {
                indexes.push(new decoration_model_1.LineCharIndex(line, textInline.length, textInline));
                return { indexes, followingChars };
            }
            if (this.config.jumper.findAllMode === 'on') {
                for (var i = 0; i < textInline.length; i++) {
                    let found = this.isInText(textInline, i, targetChars);
                    if (found) {
                        let adj = this.smartAdjBefore(textInline, targetChars[0], i);
                        indexes.push(new decoration_model_1.LineCharIndex(line, i, textInline, adj));
                        let followingChar = textInline[i + targetChars.length];
                        if (followingChar)
                            followingChars.add(followingChar);
                    }
                }
            }
            else {
                //splitted by spaces
                let words = textInline.split(new RegExp(this.config.jumper.wordSeparatorPattern));
                //current line index
                let index = 0;
                for (var i = 0; i < words.length; i++) {
                    let found = this.isInText(words[i], 0, targetChars);
                    if (found) {
                        let adj = this.smartAdjBefore(textInline, targetChars[0], i);
                        indexes.push(new decoration_model_1.LineCharIndex(line, index, textInline, adj));
                        let followingChar = textInline[i + targetChars.length];
                        if (followingChar)
                            followingChars.add(followingChar);
                    }
                    // increment by word and white space
                    index += words[i].length + 1;
                }
            }
            return { indexes, followingChars };
        };
        this.getExactLocation = (editorToModelsMap, targetChars, enableSequentialTargetChars) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            // show location candidates
            var decorators = this.decorator.createAll(editorToModelsMap, targetChars, enableSequentialTargetChars);
            let msg = this.isSelectionMode ? "metaGo: Select To" : "metaGo: Jump To";
            let messageDisposable = vscode.window.setStatusBarMessage(msg, this.config.jumper.timeout);
            try {
                let editor = (_a = vscode.window.activeTextEditor) !== null && _a !== void 0 ? _a : vscode.window.visibleTextEditors[0];
                // wait for first code key
                var letter = yield new input_1.Input(this.config).onKey(this.config.decoration.hide.trigerKey, editor, v => v, 'type the character to goto', k => {
                    if (this.jumpTimeoutId != null)
                        clearTimeout(this.jumpTimeoutId);
                    this.decorator.hideAll(decorators);
                }, k => {
                    this.jumpTimeoutId = setTimeout(() => { this.jumpTimeoutId = null; this.cancel(); }, this.config.jumper.timeout);
                    this.decorator.showAll(decorators);
                }, k => {
                });
                this.decorator.removeAll(decorators, enableSequentialTargetChars);
                if (!letter)
                    throw new Error('no key code input');
                let map = new Map();
                editorToModelsMap.forEach((models, editor) => {
                    // filter target candidates
                    let md = models.filter(model => {
                        if (model.code[0] && model.code[0] === letter) {
                            model.code = model.code.substring(1);
                            return true;
                        }
                        return false;
                    });
                    if (md.length !== 0)
                        map.set(editor, md);
                });
                return { map, letter };
            }
            catch (e) {
                this.decorator.removeAll(decorators, enableSequentialTargetChars);
                throw e;
            }
            finally {
                messageDisposable.dispose();
            }
        });
        let disposables = [];
        this.config = config;
        disposables.push(vscode.commands.registerCommand('metaGo.metaJump.backspace', () => this.stepCancel()));
        disposables.push(vscode.commands.registerCommand('metaGo.gotoAfter', () => {
            this.doJump('metaGo.gotoAfter');
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.gotoSmart', () => {
            this.doJump('metaGo.gotoSmart');
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.gotoBefore', () => {
            this.doJump('metaGo.gotoBefore');
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.gotoAfterActive', () => {
            this.doJump('metaGo.gotoAfterActive');
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.gotoSmartActive', () => {
            this.doJump('metaGo.gotoSmartActive');
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.gotoBeforeActive', () => {
            this.doJump('metaGo.gotoBeforeActive');
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.selectSmart', () => {
            this.doJump('metaGo.selectSmart');
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.selectBefore', () => {
            this.doJump('metaGo.selectBefore');
        }));
        disposables.push(vscode.commands.registerCommand('metaGo.selectAfter', () => {
            this.doJump('metaGo.selectAfter');
        }));
        for (let i = 0; i < disposables.length; i++) {
            context.subscriptions.push(disposables[i]);
        }
        this.decorationModelBuilder.initialize(this.config);
        this.decorator.initialize(this.config);
    }
    jumpTo(jumpPosition, mutiEditor = true) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isSelectionMode = false;
            try {
                var [editor, model] = yield this.getLocationWithTimeout(mutiEditor);
                this.done();
                switch (jumpPosition) {
                    case JumpPosition.Before:
                        lib_1.Utilities.goto(editor, model.line, model.char);
                        break;
                    case JumpPosition.After:
                        lib_1.Utilities.goto(editor, model.line, model.char + 1);
                        break;
                    case JumpPosition.Smart:
                        lib_1.Utilities.goto(editor, model.line, model.char + 1 + model.smartAdj);
                        break;
                    default:
                        throw "unexpected JumpPosition value";
                }
            }
            catch (err) {
                this.cancel();
                if (typeof err === 'string') {
                    console.log(err);
                    return;
                }
                console.log("metago:" + err.message + err.stack);
            }
        });
    }
    selectTo(jumpPosition) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isSelectionMode = true;
            let editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            let position = selection.active.line === selection.end.line ? selection.start : selection.end;
            let fromLine = position.line;
            let fromChar = position.character;
            try {
                var [ed, model] = yield this.getLocationWithTimeout(false);
                this.done();
                let toCharacter = model.char;
                switch (jumpPosition) {
                    case JumpPosition.Before:
                        break;
                    case JumpPosition.After:
                        toCharacter++;
                        break;
                    case JumpPosition.Smart:
                        if (model.line > fromLine) {
                            toCharacter++;
                        }
                        else if (model.line === fromLine) {
                            if (model.char > fromChar) {
                                toCharacter++;
                            }
                        }
                        break;
                    default:
                        throw "unexpected JumpPosition value";
                }
                lib_1.Utilities.select(editor, fromLine, fromChar, model.line, toCharacter);
            }
            catch (err) {
                this.cancel();
                console.log("metago:" + err);
            }
        });
    }
    done() {
        this.isJumping = false;
    }
    cancel() {
        while (input_1.Input.instances.length > 0) {
            input_1.Input.instances[0].cancelInput();
        }
        this.isJumping = false;
    }
    getLocationWithTimeout(mutiEditor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isJumping) {
                this.isJumping = true;
                this.jumpTimeoutId = setTimeout(() => { this.jumpTimeoutId = null; this.cancel(); }, this.config.jumper.timeout);
                let canceled = false;
                try {
                    vscode.commands.executeCommand('setContext', "metaGoJumping", true);
                    var model = yield this.getLocation(mutiEditor);
                    return model;
                }
                catch (e) {
                    if (e === input_1.CANCEL_MSG) {
                        canceled = true;
                    }
                    throw e;
                }
                finally {
                    if (!canceled)
                        vscode.commands.executeCommand('setContext', "metaGoJumping", false);
                    if (this.jumpTimeoutId) {
                        clearTimeout(this.jumpTimeoutId);
                        this.jumpTimeoutId = null;
                    }
                }
            }
            else {
                throw new Error('metago: reinvoke goto command');
            }
        });
    }
    getLocation(mutiEditor, enableSequentialTargetChars = true) {
        return __awaiter(this, void 0, void 0, function* () {
            let inputEditor = vscode.window.activeTextEditor;
            if (!inputEditor) {
                inputEditor = vscode.window.visibleTextEditors[0];
                if (!inputEditor) {
                    throw new Error('no visible editor');
                }
                lib_1.Utilities.goto(inputEditor);
            }
            yield vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
            let msg = this.isSelectionMode ? "metaGo: Type to Select" : "metaGo: Type To Jump";
            let messageDisposable = vscode.window.setStatusBarMessage(msg, this.config.jumper.timeout);
            try {
                this.decorator.addCommandIndicator(inputEditor);
                if (this.targetChars === "") {
                    this.targetChars = yield this.getTargetChar(inputEditor);
                    if (!this.targetChars) {
                        throw new Error('no target location char input');
                    }
                    if (this.targetChars && this.targetChars.length > 1)
                        this.targetChars = this.targetChars.substring(0, 1);
                }
                let res = yield this.getLocationFromTargetChars(inputEditor, mutiEditor, enableSequentialTargetChars);
                let msg = this.isSelectionMode ? 'metaGo: Selected!' : 'metaGo: Jumped!';
                vscode.window.setStatusBarMessage(msg, 2000);
                return res;
            }
            catch (reason) {
                if (!reason)
                    reason = new Error("Canceled!");
                this.decorator.removeCommandIndicator(inputEditor);
                vscode.window.setStatusBarMessage(`metaGo: ${reason}`, 2000);
                throw reason;
            }
            finally {
                messageDisposable.dispose();
            }
        });
    }
    getLocationFromTargetChars(inputEditor, mutiEditor, enableSequentialTargetChars, rippleSupport = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (rippleSupport && !enableSequentialTargetChars)
                throw new Error("ripple support must with sequential target chars enable");
            var editor = null;
            var models = null;
            var model = null;
            if (this.targetChars === this.config.decoration.hide.trigerKey) {
                enableSequentialTargetChars = false;
                rippleSupport = false;
            }
            let { editorToLineCharIndexesMap, lettersExclude } = yield this.findAll(mutiEditor, inputEditor, enableSequentialTargetChars);
            let editorToModelsMap = this.decorationModelBuilder.buildDecorationModel(editorToLineCharIndexesMap, lettersExclude, enableSequentialTargetChars, this.targetChars.length, rippleSupport);
            // here, we have editorToModelsMap.size > 1 || models.length > 1
            let isTargetChar = false; // if is target char, not jump, fix type muti chars may edit doc
            do {
                let { map, letter } = yield this.getExactLocation(editorToModelsMap, this.targetChars, enableSequentialTargetChars);
                if (map.size === 0) {
                    let error = "metaGo: no match in codes for input char";
                    if (!enableSequentialTargetChars)
                        throw new Error(error);
                    // find
                    this.targetChars += letter;
                    let lineCharMap = new Map();
                    let excludeLetters = new Set();
                    editorToLineCharIndexesMap.forEach((m, e) => {
                        let { lineCharIndexes, followingChars } = this.findInModel(e, m.indexes, this.targetChars);
                        if (enableSequentialTargetChars)
                            followingChars.forEach(v => excludeLetters.add(v));
                        if (lineCharIndexes.indexes.length > 0)
                            lineCharMap.set(e, lineCharIndexes);
                    });
                    if (lineCharMap.size === 0)
                        throw new Error(error);
                    // build model
                    editorToModelsMap = this.decorationModelBuilder.buildDecorationModel(lineCharMap, excludeLetters, enableSequentialTargetChars, this.targetChars.length, rippleSupport);
                    editorToLineCharIndexesMap = lineCharMap;
                    isTargetChar = true;
                }
                else {
                    editorToModelsMap = map;
                    isTargetChar = false;
                }
                [editor, models] = editorToModelsMap.entries().next().value; // first entry
            } while (isTargetChar || editorToModelsMap.size > 1 || models.length > 1);
            model = models[0];
            return [editor, model];
        });
    }
    findAll(mutiEditor, inputEditor, enableSequentialTargetChars) {
        return __awaiter(this, void 0, void 0, function* () {
            let editorToLineCharIndexesMap = new Map();
            let editors = mutiEditor ? [inputEditor, ...vscode.window.visibleTextEditors.filter(e => e !== inputEditor)] : [inputEditor];
            let lettersExclude = new Set();
            for (let editor of editors) {
                var jumpRange = yield this.getJumpRange(editor);
                let { lineCharIndexes, followingChars } = this.find(editor, jumpRange, this.targetChars);
                if (enableSequentialTargetChars)
                    followingChars.forEach(v => lettersExclude.add(v));
                if (lineCharIndexes.indexes.length > 0)
                    editorToLineCharIndexesMap.set(editor, lineCharIndexes);
            }
            return { editorToLineCharIndexesMap, lettersExclude };
        });
    }
    getJumpRange(editor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.config.jumper.findInSelection === 'on') {
                let selections = editor.selections;
                selections = selections.filter(s => !s.isEmpty);
                if (selections.length != 0) // editor.selection.isEmpty
                    return selections;
            }
            return editor.visibleRanges;
        });
    }
    isInText(text, char, targetChars) {
        var targetLowCase = targetChars.toLocaleLowerCase();
        let lastIndex = targetChars.length - 1;
        var last = targetChars[lastIndex];
        let lastLowCase = targetLowCase[lastIndex];
        let ignoreCase = lastLowCase === last; // no UperCase
        let str = text.substring(char, char + targetChars.length);
        str = str.padEnd(targetChars.length, '\n');
        let r = (str.toLocaleLowerCase() === targetLowCase) && (ignoreCase ? true : str[lastIndex] === last);
        return r;
    }
    findInModel(editor, models, targetChars) {
        let { selection } = editor;
        let lineCharIndexes = {
            lowIndexNearFocus: -1,
            highIndexNearFocus: -1,
            indexes: [],
            firstIndexInParagraph: -1,
            lastIndexInParagraphy: -1,
        };
        let followingChars = new Set();
        let ms = models.filter((m) => {
            let r = this.isInText(m.text, m.char, targetChars);
            let next = m.text[m.char + targetChars.length];
            if (r && next) {
                followingChars.add(next);
            }
            return r;
        });
        lineCharIndexes.indexes = ms;
        this.updateIndexes(selection.active.line, selection.active.character, lineCharIndexes);
        return { lineCharIndexes, followingChars };
    }
    updateIndexes(line, char, lineCharIndexes) {
        lineCharIndexes.indexes.forEach((m, i) => {
            let lineIndex = m.line;
            if (lineIndex < line) { //up
                lineCharIndexes.lowIndexNearFocus = i;
            }
            else if (lineIndex == line) {
                if (m.char <= char) { // left
                    lineCharIndexes.lowIndexNearFocus = i;
                }
            }
        });
        if (lineCharIndexes.firstIndexInParagraph === -1 && lineCharIndexes.indexes.length > 0) {
            lineCharIndexes.firstIndexInParagraph = 0;
        }
        if (lineCharIndexes.lastIndexInParagraphy === -1) { // no empty line after active line
            lineCharIndexes.lastIndexInParagraphy = lineCharIndexes.indexes.length - 1;
        }
        if (lineCharIndexes.firstIndexInParagraph === lineCharIndexes.indexes.length) { // no index after empty line
            lineCharIndexes.firstIndexInParagraph = -1;
            lineCharIndexes.lastIndexInParagraphy = -1;
        }
        if (lineCharIndexes.lowIndexNearFocus !== lineCharIndexes.indexes.length - 1)
            lineCharIndexes.highIndexNearFocus = lineCharIndexes.lowIndexNearFocus + 1;
    }
    smartAdjBefore(str, char, index) {
        let regexp = new RegExp('\\w');
        if (this.smartAdjBeforeRegex(str, char, index, regexp) === decoration_model_1.SmartAdjustment.Before) {
            return decoration_model_1.SmartAdjustment.Before;
        }
        regexp = new RegExp(/[^\w\s]/);
        return this.smartAdjBeforeRegex(str, char, index, regexp);
    }
    smartAdjBeforeRegex(str, char, index, regexp) {
        if (regexp.test(char)) {
            if (index === 0 && str.length !== 1) {
                if (regexp.test(str[1]))
                    return decoration_model_1.SmartAdjustment.Before;
            }
            else {
                if (str[index + 1] && regexp.test(str[index + 1]) && !regexp.test(str[index - 1]))
                    return decoration_model_1.SmartAdjustment.Before;
            }
        }
        return decoration_model_1.SmartAdjustment.Default;
    }
}
exports.MetaJumper = MetaJumper;


/***/ }),

/***/ "./src/metajumper/input.ts":
/*!*********************************!*\
  !*** ./src/metajumper/input.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
exports.CANCEL_MSG = 'input canceled';
class InputModel {
    constructor() {
        this.autoCompleteAferOneInput = true;
        this.text = "";
    }
}
class Input {
    constructor(config) {
        this.subscriptions = [];
        this.inputModel = new InputModel();
        this.input = (editor, validateInput = v => v, placeHolder = 'type the character to goto') => {
            this.editor = editor;
            this.setContext(true);
            this.inputModel.validateInput = validateInput;
            let firstTime = true;
            try {
                this.registerCommand('type', this.onType);
                this.inputModel.useInputBox = true;
            }
            catch (e) {
                this.inputModel.useInputBox = true;
                const ct = new vscode.CancellationTokenSource();
                this.inputModel.inputBoxToken = ct;
                vscode.window.showInputBox({
                    placeHolder: placeHolder,
                    prompt: 'metaGo ',
                    validateInput: (s) => {
                        if (!s)
                            return '';
                        this.onType({ text: s });
                        return null;
                    }
                }, ct.token).then((s) => {
                    if (s === undefined) //esc
                        this.cancel(editor);
                    else if (s === '') // enter
                        this.onType({ text: '\n' });
                });
            }
            return new Promise((resolve, reject) => {
                this.inputModel.resolve = resolve;
                this.inputModel.reject = reject;
                vscode.window.onDidChangeActiveTextEditor(() => {
                    this.cancel(editor);
                });
            });
        };
        this.onType = (event) => {
            const editor = vscode.window.activeTextEditor;
            if (this.inputModel) {
                this.inputModel.text += event.text;
                this.inputModel.text = this.inputModel.validateInput(this.inputModel.text);
                this.inputModel.resolve(this.inputModel.text);
                if (this.inputModel.autoCompleteAferOneInput)
                    this.complete(editor);
            }
            else
                vscode.commands.executeCommand('default:type', event);
        };
        this.dispose = () => {
            this.inputModel.autoCompleteAferOneInput = true;
            this.subscriptions.forEach((d) => d.dispose());
            const i = Input.instances.indexOf(this);
            if (i > -1)
                Input.instances.splice(i, 1);
        };
        this.registerTextEditorCommand = (commandId, run) => {
            this.subscriptions.push(vscode.commands.registerTextEditorCommand(commandId, run));
        };
        this.registerCommand = (commandId, run) => {
            this.subscriptions.push(vscode.commands.registerCommand(commandId, run));
        };
        this.complete = (editor) => {
            var _a;
            (_a = this.inputModel.inputBoxToken) === null || _a === void 0 ? void 0 : _a.cancel();
            this.inputModel.inputBoxToken = null;
            this.dispose();
            this.setContext(false);
        };
        this.cancel = (editor) => {
            this.inputModel.reject(exports.CANCEL_MSG);
            this.dispose();
            this.setContext(false);
        };
        this._config = config;
        this.registerTextEditorCommand('metaGo.input.cancel', this.cancel);
        Input.instances.push(this);
    }
    onKey(key, editor, validateInput = v => v, placeHolder = 'press a key', keyDown, keyUp, cancel) {
        this.inputModel.autoCompleteAferOneInput = false;
        let jumpTimeoutId = null;
        let keyDownCalled = false;
        let initialDelay = this._config.decoration.hide.triggerKeyDownRepeatInitialDelay;
        let interval = this._config.decoration.hide.triggerKeyDownRepeatInterval;
        let firstTimeDowned = false;
        let resolve;
        let reject;
        let downPromise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this.input(editor, validateInput, placeHolder);
        this.inputModel.reject = k => {
            reject(k);
        };
        this.inputModel.resolve = k => {
            var last = k.charAt(k.length - 1);
            if (last === key) {
                if (jumpTimeoutId)
                    clearTimeout(jumpTimeoutId);
                if (!keyDownCalled) {
                    keyDownCalled = true;
                    keyDown(k);
                }
                jumpTimeoutId = setTimeout(() => { keyDownCalled = false; jumpTimeoutId = null; firstTimeDowned = false; keyUp(k); }, firstTimeDowned ? interval : initialDelay);
                if (!firstTimeDowned)
                    firstTimeDowned = true;
            }
            else {
                if (jumpTimeoutId)
                    clearTimeout(jumpTimeoutId);
                cancel(last);
                resolve(last);
                this.complete(editor);
            }
        };
        return downPromise;
    }
    setContext(value) {
        vscode.commands.executeCommand('setContext', "metaGoInput", value);
    }
    cancelInput() {
        this.cancel(this.editor);
    }
}
exports.Input = Input;
Input.instances = [];


/***/ }),

/***/ "./src/select-lines.ts":
/*!*****************************!*\
  !*** ./src/select-lines.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __webpack_require__(/*! vscode */ "vscode");
class SelectLines {
    constructor(context) {
        let disposable = vscode.commands.registerCommand('metaGo.selectLineUp', () => {
            const editor = vscode.window.activeTextEditor;
            const line = editor.selection.active.line - 1;
            const selection = editor.selection;
            let anchor = selection.anchor;
            if (selection.isEmpty)
                anchor = new vscode.Position(anchor.line + 1, 0);
            const toLine = line >= 0 ? line : 0;
            editor.selection = new vscode.Selection(anchor, new vscode.Position(toLine, 0));
            editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.end));
        });
        context.subscriptions.push(disposable);
        let disposableD = vscode.commands.registerCommand('metaGo.selectLineDown', () => {
            const editor = vscode.window.activeTextEditor;
            const line = editor.selection.active.line + 1;
            const selection = editor.selection;
            let anchor = selection.anchor;
            if (selection.isEmpty)
                anchor = new vscode.Position(anchor.line, 0);
            const boundary = editor.document.lineCount;
            const toLine = line <= boundary ? line : boundary;
            editor.selection = new vscode.Selection(anchor, new vscode.Position(toLine, 0));
            editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.end));
        });
        context.subscriptions.push(disposableD);
    }
}
exports.SelectLines = SelectLines;


/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "vscode":
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("vscode");

/***/ })

/******/ });
//# sourceMappingURL=extension.js.map