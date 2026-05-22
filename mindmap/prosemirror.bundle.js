(function() {
	//#region \0rolldown/runtime.js
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
	var __exportAll = (all, no_symbols) => {
		let target = {};
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
		if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
		return target;
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
			key = keys[i];
			if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: ((k) => from[k]).bind(null, key),
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	//#endregion
	//#region node_modules/orderedmap/dist/index.js
	function OrderedMap(content) {
		this.content = content;
	}
	OrderedMap.prototype = {
		constructor: OrderedMap,
		find: function(key) {
			for (var i = 0; i < this.content.length; i += 2) if (this.content[i] === key) return i;
			return -1;
		},
		get: function(key) {
			var found = this.find(key);
			return found == -1 ? void 0 : this.content[found + 1];
		},
		update: function(key, value, newKey) {
			var self = newKey && newKey != key ? this.remove(newKey) : this;
			var found = self.find(key), content = self.content.slice();
			if (found == -1) content.push(newKey || key, value);
			else {
				content[found + 1] = value;
				if (newKey) content[found] = newKey;
			}
			return new OrderedMap(content);
		},
		remove: function(key) {
			var found = this.find(key);
			if (found == -1) return this;
			var content = this.content.slice();
			content.splice(found, 2);
			return new OrderedMap(content);
		},
		addToStart: function(key, value) {
			return new OrderedMap([key, value].concat(this.remove(key).content));
		},
		addToEnd: function(key, value) {
			var content = this.remove(key).content.slice();
			content.push(key, value);
			return new OrderedMap(content);
		},
		addBefore: function(place, key, value) {
			var without = this.remove(key), content = without.content.slice();
			var found = without.find(place);
			content.splice(found == -1 ? content.length : found, 0, key, value);
			return new OrderedMap(content);
		},
		forEach: function(f) {
			for (var i = 0; i < this.content.length; i += 2) f(this.content[i], this.content[i + 1]);
		},
		prepend: function(map) {
			map = OrderedMap.from(map);
			if (!map.size) return this;
			return new OrderedMap(map.content.concat(this.subtract(map).content));
		},
		append: function(map) {
			map = OrderedMap.from(map);
			if (!map.size) return this;
			return new OrderedMap(this.subtract(map).content.concat(map.content));
		},
		subtract: function(map) {
			var result = this;
			map = OrderedMap.from(map);
			for (var i = 0; i < map.content.length; i += 2) result = result.remove(map.content[i]);
			return result;
		},
		toObject: function() {
			var result = {};
			this.forEach(function(key, value) {
				result[key] = value;
			});
			return result;
		},
		get size() {
			return this.content.length >> 1;
		}
	};
	OrderedMap.from = function(value) {
		if (value instanceof OrderedMap) return value;
		var content = [];
		if (value) for (var prop in value) content.push(prop, value[prop]);
		return new OrderedMap(content);
	};
	//#endregion
	//#region node_modules/prosemirror-model/dist/index.js
	function findDiffStart(a, b, pos) {
		for (let i = 0;; i++) {
			if (i == a.childCount || i == b.childCount) return a.childCount == b.childCount ? null : pos;
			let childA = a.child(i), childB = b.child(i);
			if (childA == childB) {
				pos += childA.nodeSize;
				continue;
			}
			if (!childA.sameMarkup(childB)) return pos;
			if (childA.isText && childA.text != childB.text) {
				for (let j = 0; childA.text[j] == childB.text[j]; j++) pos++;
				return pos;
			}
			if (childA.content.size || childB.content.size) {
				let inner = findDiffStart(childA.content, childB.content, pos + 1);
				if (inner != null) return inner;
			}
			pos += childA.nodeSize;
		}
	}
	function findDiffEnd(a, b, posA, posB) {
		for (let iA = a.childCount, iB = b.childCount;;) {
			if (iA == 0 || iB == 0) return iA == iB ? null : {
				a: posA,
				b: posB
			};
			let childA = a.child(--iA), childB = b.child(--iB), size = childA.nodeSize;
			if (childA == childB) {
				posA -= size;
				posB -= size;
				continue;
			}
			if (!childA.sameMarkup(childB)) return {
				a: posA,
				b: posB
			};
			if (childA.isText && childA.text != childB.text) {
				let same = 0, minSize = Math.min(childA.text.length, childB.text.length);
				while (same < minSize && childA.text[childA.text.length - same - 1] == childB.text[childB.text.length - same - 1]) {
					same++;
					posA--;
					posB--;
				}
				return {
					a: posA,
					b: posB
				};
			}
			if (childA.content.size || childB.content.size) {
				let inner = findDiffEnd(childA.content, childB.content, posA - 1, posB - 1);
				if (inner) return inner;
			}
			posA -= size;
			posB -= size;
		}
	}
	/**
	A fragment represents a node's collection of child nodes.
	
	Like nodes, fragments are persistent data structures, and you
	should not mutate them or their content. Rather, you create new
	instances whenever needed. The API tries to make this easy.
	*/
	var Fragment = class Fragment {
		/**
		@internal
		*/
		constructor(content, size) {
			this.content = content;
			this.size = size || 0;
			if (size == null) for (let i = 0; i < content.length; i++) this.size += content[i].nodeSize;
		}
		/**
		Invoke a callback for all descendant nodes between the given two
		positions (relative to start of this fragment). Doesn't descend
		into a node when the callback returns `false`.
		*/
		nodesBetween(from, to, f, nodeStart = 0, parent) {
			for (let i = 0, pos = 0; pos < to; i++) {
				let child = this.content[i], end = pos + child.nodeSize;
				if (end > from && f(child, nodeStart + pos, parent || null, i) !== false && child.content.size) {
					let start = pos + 1;
					child.nodesBetween(Math.max(0, from - start), Math.min(child.content.size, to - start), f, nodeStart + start);
				}
				pos = end;
			}
		}
		/**
		Call the given callback for every descendant node. `pos` will be
		relative to the start of the fragment. The callback may return
		`false` to prevent traversal of a given node's children.
		*/
		descendants(f) {
			this.nodesBetween(0, this.size, f);
		}
		/**
		Extract the text between `from` and `to`. See the same method on
		[`Node`](https://prosemirror.net/docs/ref/#model.Node.textBetween).
		*/
		textBetween(from, to, blockSeparator, leafText) {
			let text = "", first = true;
			this.nodesBetween(from, to, (node, pos) => {
				let nodeText = node.isText ? node.text.slice(Math.max(from, pos) - pos, to - pos) : !node.isLeaf ? "" : leafText ? typeof leafText === "function" ? leafText(node) : leafText : node.type.spec.leafText ? node.type.spec.leafText(node) : "";
				if (node.isBlock && (node.isLeaf && nodeText || node.isTextblock) && blockSeparator) if (first) first = false;
				else text += blockSeparator;
				text += nodeText;
			}, 0);
			return text;
		}
		/**
		Create a new fragment containing the combined content of this
		fragment and the other.
		*/
		append(other) {
			if (!other.size) return this;
			if (!this.size) return other;
			let last = this.lastChild, first = other.firstChild, content = this.content.slice(), i = 0;
			if (last.isText && last.sameMarkup(first)) {
				content[content.length - 1] = last.withText(last.text + first.text);
				i = 1;
			}
			for (; i < other.content.length; i++) content.push(other.content[i]);
			return new Fragment(content, this.size + other.size);
		}
		/**
		Cut out the sub-fragment between the two given positions.
		*/
		cut(from, to = this.size) {
			if (from == 0 && to == this.size) return this;
			let result = [], size = 0;
			if (to > from) for (let i = 0, pos = 0; pos < to; i++) {
				let child = this.content[i], end = pos + child.nodeSize;
				if (end > from) {
					if (pos < from || end > to) if (child.isText) child = child.cut(Math.max(0, from - pos), Math.min(child.text.length, to - pos));
					else child = child.cut(Math.max(0, from - pos - 1), Math.min(child.content.size, to - pos - 1));
					result.push(child);
					size += child.nodeSize;
				}
				pos = end;
			}
			return new Fragment(result, size);
		}
		/**
		@internal
		*/
		cutByIndex(from, to) {
			if (from == to) return Fragment.empty;
			if (from == 0 && to == this.content.length) return this;
			return new Fragment(this.content.slice(from, to));
		}
		/**
		Create a new fragment in which the node at the given index is
		replaced by the given node.
		*/
		replaceChild(index, node) {
			let current = this.content[index];
			if (current == node) return this;
			let copy = this.content.slice();
			let size = this.size + node.nodeSize - current.nodeSize;
			copy[index] = node;
			return new Fragment(copy, size);
		}
		/**
		Create a new fragment by prepending the given node to this
		fragment.
		*/
		addToStart(node) {
			return new Fragment([node].concat(this.content), this.size + node.nodeSize);
		}
		/**
		Create a new fragment by appending the given node to this
		fragment.
		*/
		addToEnd(node) {
			return new Fragment(this.content.concat(node), this.size + node.nodeSize);
		}
		/**
		Compare this fragment to another one.
		*/
		eq(other) {
			if (this.content.length != other.content.length) return false;
			for (let i = 0; i < this.content.length; i++) if (!this.content[i].eq(other.content[i])) return false;
			return true;
		}
		/**
		The first child of the fragment, or `null` if it is empty.
		*/
		get firstChild() {
			return this.content.length ? this.content[0] : null;
		}
		/**
		The last child of the fragment, or `null` if it is empty.
		*/
		get lastChild() {
			return this.content.length ? this.content[this.content.length - 1] : null;
		}
		/**
		The number of child nodes in this fragment.
		*/
		get childCount() {
			return this.content.length;
		}
		/**
		Get the child node at the given index. Raise an error when the
		index is out of range.
		*/
		child(index) {
			let found = this.content[index];
			if (!found) throw new RangeError("Index " + index + " out of range for " + this);
			return found;
		}
		/**
		Get the child node at the given index, if it exists.
		*/
		maybeChild(index) {
			return this.content[index] || null;
		}
		/**
		Call `f` for every child node, passing the node, its offset
		into this parent node, and its index.
		*/
		forEach(f) {
			for (let i = 0, p = 0; i < this.content.length; i++) {
				let child = this.content[i];
				f(child, p, i);
				p += child.nodeSize;
			}
		}
		/**
		Find the first position at which this fragment and another
		fragment differ, or `null` if they are the same.
		*/
		findDiffStart(other, pos = 0) {
			return findDiffStart(this, other, pos);
		}
		/**
		Find the first position, searching from the end, at which this
		fragment and the given fragment differ, or `null` if they are
		the same. Since this position will not be the same in both
		nodes, an object with two separate positions is returned.
		*/
		findDiffEnd(other, pos = this.size, otherPos = other.size) {
			return findDiffEnd(this, other, pos, otherPos);
		}
		/**
		Find the index and inner offset corresponding to a given relative
		position in this fragment. The result object will be reused
		(overwritten) the next time the function is called. @internal
		*/
		findIndex(pos) {
			if (pos == 0) return retIndex(0, pos);
			if (pos == this.size) return retIndex(this.content.length, pos);
			if (pos > this.size || pos < 0) throw new RangeError(`Position ${pos} outside of fragment (${this})`);
			for (let i = 0, curPos = 0;; i++) {
				let cur = this.child(i), end = curPos + cur.nodeSize;
				if (end >= pos) {
					if (end == pos) return retIndex(i + 1, end);
					return retIndex(i, curPos);
				}
				curPos = end;
			}
		}
		/**
		Return a debugging string that describes this fragment.
		*/
		toString() {
			return "<" + this.toStringInner() + ">";
		}
		/**
		@internal
		*/
		toStringInner() {
			return this.content.join(", ");
		}
		/**
		Create a JSON-serializeable representation of this fragment.
		*/
		toJSON() {
			return this.content.length ? this.content.map((n) => n.toJSON()) : null;
		}
		/**
		Deserialize a fragment from its JSON representation.
		*/
		static fromJSON(schema, value) {
			if (!value) return Fragment.empty;
			if (!Array.isArray(value)) throw new RangeError("Invalid input for Fragment.fromJSON");
			return Fragment.fromArray(value.map(schema.nodeFromJSON));
		}
		/**
		Build a fragment from an array of nodes. Ensures that adjacent
		text nodes with the same marks are joined together.
		*/
		static fromArray(array) {
			if (!array.length) return Fragment.empty;
			let joined, size = 0;
			for (let i = 0; i < array.length; i++) {
				let node = array[i];
				size += node.nodeSize;
				if (i && node.isText && array[i - 1].sameMarkup(node)) {
					if (!joined) joined = array.slice(0, i);
					joined[joined.length - 1] = node.withText(joined[joined.length - 1].text + node.text);
				} else if (joined) joined.push(node);
			}
			return new Fragment(joined || array, size);
		}
		/**
		Create a fragment from something that can be interpreted as a
		set of nodes. For `null`, it returns the empty fragment. For a
		fragment, the fragment itself. For a node or array of nodes, a
		fragment containing those nodes.
		*/
		static from(nodes) {
			if (!nodes) return Fragment.empty;
			if (nodes instanceof Fragment) return nodes;
			if (Array.isArray(nodes)) return this.fromArray(nodes);
			if (nodes.attrs) return new Fragment([nodes], nodes.nodeSize);
			throw new RangeError("Can not convert " + nodes + " to a Fragment" + (nodes.nodesBetween ? " (looks like multiple versions of prosemirror-model were loaded)" : ""));
		}
	};
	/**
	An empty fragment. Intended to be reused whenever a node doesn't
	contain anything (rather than allocating a new empty fragment for
	each leaf node).
	*/
	Fragment.empty = new Fragment([], 0);
	var found = {
		index: 0,
		offset: 0
	};
	function retIndex(index, offset) {
		found.index = index;
		found.offset = offset;
		return found;
	}
	function compareDeep(a, b) {
		if (a === b) return true;
		if (!(a && typeof a == "object") || !(b && typeof b == "object")) return false;
		let array = Array.isArray(a);
		if (Array.isArray(b) != array) return false;
		if (array) {
			if (a.length != b.length) return false;
			for (let i = 0; i < a.length; i++) if (!compareDeep(a[i], b[i])) return false;
		} else {
			for (let p in a) if (!(p in b) || !compareDeep(a[p], b[p])) return false;
			for (let p in b) if (!(p in a)) return false;
		}
		return true;
	}
	/**
	A mark is a piece of information that can be attached to a node,
	such as it being emphasized, in code font, or a link. It has a
	type and optionally a set of attributes that provide further
	information (such as the target of the link). Marks are created
	through a `Schema`, which controls which types exist and which
	attributes they have.
	*/
	var Mark = class Mark {
		/**
		@internal
		*/
		constructor(type, attrs) {
			this.type = type;
			this.attrs = attrs;
		}
		/**
		Given a set of marks, create a new set which contains this one as
		well, in the right position. If this mark is already in the set,
		the set itself is returned. If any marks that are set to be
		[exclusive](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) with this mark are present,
		those are replaced by this one.
		*/
		addToSet(set) {
			let copy, placed = false;
			for (let i = 0; i < set.length; i++) {
				let other = set[i];
				if (this.eq(other)) return set;
				if (this.type.excludes(other.type)) {
					if (!copy) copy = set.slice(0, i);
				} else if (other.type.excludes(this.type)) return set;
				else {
					if (!placed && other.type.rank > this.type.rank) {
						if (!copy) copy = set.slice(0, i);
						copy.push(this);
						placed = true;
					}
					if (copy) copy.push(other);
				}
			}
			if (!copy) copy = set.slice();
			if (!placed) copy.push(this);
			return copy;
		}
		/**
		Remove this mark from the given set, returning a new set. If this
		mark is not in the set, the set itself is returned.
		*/
		removeFromSet(set) {
			for (let i = 0; i < set.length; i++) if (this.eq(set[i])) return set.slice(0, i).concat(set.slice(i + 1));
			return set;
		}
		/**
		Test whether this mark is in the given set of marks.
		*/
		isInSet(set) {
			for (let i = 0; i < set.length; i++) if (this.eq(set[i])) return true;
			return false;
		}
		/**
		Test whether this mark has the same type and attributes as
		another mark.
		*/
		eq(other) {
			return this == other || this.type == other.type && compareDeep(this.attrs, other.attrs);
		}
		/**
		Convert this mark to a JSON-serializeable representation.
		*/
		toJSON() {
			let obj = { type: this.type.name };
			for (let _ in this.attrs) {
				obj.attrs = this.attrs;
				break;
			}
			return obj;
		}
		/**
		Deserialize a mark from JSON.
		*/
		static fromJSON(schema, json) {
			if (!json) throw new RangeError("Invalid input for Mark.fromJSON");
			let type = schema.marks[json.type];
			if (!type) throw new RangeError(`There is no mark type ${json.type} in this schema`);
			let mark = type.create(json.attrs);
			type.checkAttrs(mark.attrs);
			return mark;
		}
		/**
		Test whether two sets of marks are identical.
		*/
		static sameSet(a, b) {
			if (a == b) return true;
			if (a.length != b.length) return false;
			for (let i = 0; i < a.length; i++) if (!a[i].eq(b[i])) return false;
			return true;
		}
		/**
		Create a properly sorted mark set from null, a single mark, or an
		unsorted array of marks.
		*/
		static setFrom(marks) {
			if (!marks || Array.isArray(marks) && marks.length == 0) return Mark.none;
			if (marks instanceof Mark) return [marks];
			let copy = marks.slice();
			copy.sort((a, b) => a.type.rank - b.type.rank);
			return copy;
		}
	};
	/**
	The empty set of marks.
	*/
	Mark.none = [];
	/**
	Error type raised by [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) when
	given an invalid replacement.
	*/
	var ReplaceError = class extends Error {};
	/**
	A slice represents a piece cut out of a larger document. It
	stores not only a fragment, but also the depth up to which nodes on
	both side are ‘open’ (cut through).
	*/
	var Slice = class Slice {
		/**
		Create a slice. When specifying a non-zero open depth, you must
		make sure that there are nodes of at least that depth at the
		appropriate side of the fragment—i.e. if the fragment is an
		empty paragraph node, `openStart` and `openEnd` can't be greater
		than 1.
		
		It is not necessary for the content of open nodes to conform to
		the schema's content constraints, though it should be a valid
		start/end/middle for such a node, depending on which sides are
		open.
		*/
		constructor(content, openStart, openEnd) {
			this.content = content;
			this.openStart = openStart;
			this.openEnd = openEnd;
		}
		/**
		The size this slice would add when inserted into a document.
		*/
		get size() {
			return this.content.size - this.openStart - this.openEnd;
		}
		/**
		@internal
		*/
		insertAt(pos, fragment) {
			let content = insertInto(this.content, pos + this.openStart, fragment, this.openStart + 1, this.openEnd + 1);
			return content && new Slice(content, this.openStart, this.openEnd);
		}
		/**
		@internal
		*/
		removeBetween(from, to) {
			return new Slice(removeRange(this.content, from + this.openStart, to + this.openStart), this.openStart, this.openEnd);
		}
		/**
		Tests whether this slice is equal to another slice.
		*/
		eq(other) {
			return this.content.eq(other.content) && this.openStart == other.openStart && this.openEnd == other.openEnd;
		}
		/**
		@internal
		*/
		toString() {
			return this.content + "(" + this.openStart + "," + this.openEnd + ")";
		}
		/**
		Convert a slice to a JSON-serializable representation.
		*/
		toJSON() {
			if (!this.content.size) return null;
			let json = { content: this.content.toJSON() };
			if (this.openStart > 0) json.openStart = this.openStart;
			if (this.openEnd > 0) json.openEnd = this.openEnd;
			return json;
		}
		/**
		Deserialize a slice from its JSON representation.
		*/
		static fromJSON(schema, json) {
			if (!json) return Slice.empty;
			let openStart = json.openStart || 0, openEnd = json.openEnd || 0;
			if (typeof openStart != "number" || typeof openEnd != "number") throw new RangeError("Invalid input for Slice.fromJSON");
			return new Slice(Fragment.fromJSON(schema, json.content), openStart, openEnd);
		}
		/**
		Create a slice from a fragment by taking the maximum possible
		open value on both side of the fragment.
		*/
		static maxOpen(fragment, openIsolating = true) {
			let openStart = 0, openEnd = 0;
			for (let n = fragment.firstChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.firstChild) openStart++;
			for (let n = fragment.lastChild; n && !n.isLeaf && (openIsolating || !n.type.spec.isolating); n = n.lastChild) openEnd++;
			return new Slice(fragment, openStart, openEnd);
		}
	};
	/**
	The empty slice.
	*/
	Slice.empty = new Slice(Fragment.empty, 0, 0);
	function removeRange(content, from, to) {
		let { index, offset } = content.findIndex(from), child = content.maybeChild(index);
		let { index: indexTo, offset: offsetTo } = content.findIndex(to);
		if (offset == from || child.isText) {
			if (offsetTo != to && !content.child(indexTo).isText) throw new RangeError("Removing non-flat range");
			return content.cut(0, from).append(content.cut(to));
		}
		if (index != indexTo) throw new RangeError("Removing non-flat range");
		return content.replaceChild(index, child.copy(removeRange(child.content, from - offset - 1, to - offset - 1)));
	}
	function insertInto(content, dist, insert, openStart, openEnd, parent) {
		let { index, offset } = content.findIndex(dist), child = content.maybeChild(index);
		if (offset == dist || child.isText) {
			if (parent && openStart <= 0 && openEnd <= 0 && !parent.canReplace(index, index, insert)) return null;
			return content.cut(0, dist).append(insert).append(content.cut(dist));
		}
		let inner = insertInto(child.content, dist - offset - 1, insert, index == 0 ? openStart - 1 : 0, index == content.childCount - 1 ? openEnd - 1 : 0, child);
		return inner && content.replaceChild(index, child.copy(inner));
	}
	function replace($from, $to, slice) {
		if (slice.openStart > $from.depth) throw new ReplaceError("Inserted content deeper than insertion position");
		if ($from.depth - slice.openStart != $to.depth - slice.openEnd) throw new ReplaceError("Inconsistent open depths");
		return replaceOuter($from, $to, slice, 0);
	}
	function replaceOuter($from, $to, slice, depth) {
		let index = $from.index(depth), node = $from.node(depth);
		if (index == $to.index(depth) && depth < $from.depth - slice.openStart) {
			let inner = replaceOuter($from, $to, slice, depth + 1);
			return node.copy(node.content.replaceChild(index, inner));
		} else if (!slice.content.size) return close(node, replaceTwoWay($from, $to, depth));
		else if (!slice.openStart && !slice.openEnd && $from.depth == depth && $to.depth == depth) {
			let parent = $from.parent, content = parent.content;
			return close(parent, content.cut(0, $from.parentOffset).append(slice.content).append(content.cut($to.parentOffset)));
		} else {
			let { start, end } = prepareSliceForReplace(slice, $from);
			return close(node, replaceThreeWay($from, start, end, $to, depth));
		}
	}
	function checkJoin(main, sub) {
		if (!sub.type.compatibleContent(main.type)) throw new ReplaceError("Cannot join " + sub.type.name + " onto " + main.type.name);
	}
	function joinable$1($before, $after, depth) {
		let node = $before.node(depth);
		checkJoin(node, $after.node(depth));
		return node;
	}
	function addNode(child, target) {
		let last = target.length - 1;
		if (last >= 0 && child.isText && child.sameMarkup(target[last])) target[last] = child.withText(target[last].text + child.text);
		else target.push(child);
	}
	function addRange($start, $end, depth, target) {
		let node = ($end || $start).node(depth);
		let startIndex = 0, endIndex = $end ? $end.index(depth) : node.childCount;
		if ($start) {
			startIndex = $start.index(depth);
			if ($start.depth > depth) startIndex++;
			else if ($start.textOffset) {
				addNode($start.nodeAfter, target);
				startIndex++;
			}
		}
		for (let i = startIndex; i < endIndex; i++) addNode(node.child(i), target);
		if ($end && $end.depth == depth && $end.textOffset) addNode($end.nodeBefore, target);
	}
	function close(node, content) {
		node.type.checkContent(content);
		return node.copy(content);
	}
	function replaceThreeWay($from, $start, $end, $to, depth) {
		let openStart = $from.depth > depth && joinable$1($from, $start, depth + 1);
		let openEnd = $to.depth > depth && joinable$1($end, $to, depth + 1);
		let content = [];
		addRange(null, $from, depth, content);
		if (openStart && openEnd && $start.index(depth) == $end.index(depth)) {
			checkJoin(openStart, openEnd);
			addNode(close(openStart, replaceThreeWay($from, $start, $end, $to, depth + 1)), content);
		} else {
			if (openStart) addNode(close(openStart, replaceTwoWay($from, $start, depth + 1)), content);
			addRange($start, $end, depth, content);
			if (openEnd) addNode(close(openEnd, replaceTwoWay($end, $to, depth + 1)), content);
		}
		addRange($to, null, depth, content);
		return new Fragment(content);
	}
	function replaceTwoWay($from, $to, depth) {
		let content = [];
		addRange(null, $from, depth, content);
		if ($from.depth > depth) addNode(close(joinable$1($from, $to, depth + 1), replaceTwoWay($from, $to, depth + 1)), content);
		addRange($to, null, depth, content);
		return new Fragment(content);
	}
	function prepareSliceForReplace(slice, $along) {
		let extra = $along.depth - slice.openStart;
		let node = $along.node(extra).copy(slice.content);
		for (let i = extra - 1; i >= 0; i--) node = $along.node(i).copy(Fragment.from(node));
		return {
			start: node.resolveNoCache(slice.openStart + extra),
			end: node.resolveNoCache(node.content.size - slice.openEnd - extra)
		};
	}
	/**
	You can [_resolve_](https://prosemirror.net/docs/ref/#model.Node.resolve) a position to get more
	information about it. Objects of this class represent such a
	resolved position, providing various pieces of context
	information, and some helper methods.
	
	Throughout this interface, methods that take an optional `depth`
	parameter will interpret undefined as `this.depth` and negative
	numbers as `this.depth + value`.
	*/
	var ResolvedPos = class ResolvedPos {
		/**
		@internal
		*/
		constructor(pos, path, parentOffset) {
			this.pos = pos;
			this.path = path;
			this.parentOffset = parentOffset;
			this.depth = path.length / 3 - 1;
		}
		/**
		@internal
		*/
		resolveDepth(val) {
			if (val == null) return this.depth;
			if (val < 0) return this.depth + val;
			return val;
		}
		/**
		The parent node that the position points into. Note that even if
		a position points into a text node, that node is not considered
		the parent—text nodes are ‘flat’ in this model, and have no content.
		*/
		get parent() {
			return this.node(this.depth);
		}
		/**
		The root node in which the position was resolved.
		*/
		get doc() {
			return this.node(0);
		}
		/**
		The ancestor node at the given level. `p.node(p.depth)` is the
		same as `p.parent`.
		*/
		node(depth) {
			return this.path[this.resolveDepth(depth) * 3];
		}
		/**
		The index into the ancestor at the given level. If this points
		at the 3rd node in the 2nd paragraph on the top level, for
		example, `p.index(0)` is 1 and `p.index(1)` is 2.
		*/
		index(depth) {
			return this.path[this.resolveDepth(depth) * 3 + 1];
		}
		/**
		The index pointing after this position into the ancestor at the
		given level.
		*/
		indexAfter(depth) {
			depth = this.resolveDepth(depth);
			return this.index(depth) + (depth == this.depth && !this.textOffset ? 0 : 1);
		}
		/**
		The (absolute) position at the start of the node at the given
		level.
		*/
		start(depth) {
			depth = this.resolveDepth(depth);
			return depth == 0 ? 0 : this.path[depth * 3 - 1] + 1;
		}
		/**
		The (absolute) position at the end of the node at the given
		level.
		*/
		end(depth) {
			depth = this.resolveDepth(depth);
			return this.start(depth) + this.node(depth).content.size;
		}
		/**
		The (absolute) position directly before the wrapping node at the
		given level, or, when `depth` is `this.depth + 1`, the original
		position.
		*/
		before(depth) {
			depth = this.resolveDepth(depth);
			if (!depth) throw new RangeError("There is no position before the top-level node");
			return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1];
		}
		/**
		The (absolute) position directly after the wrapping node at the
		given level, or the original position when `depth` is `this.depth + 1`.
		*/
		after(depth) {
			depth = this.resolveDepth(depth);
			if (!depth) throw new RangeError("There is no position after the top-level node");
			return depth == this.depth + 1 ? this.pos : this.path[depth * 3 - 1] + this.path[depth * 3].nodeSize;
		}
		/**
		When this position points into a text node, this returns the
		distance between the position and the start of the text node.
		Will be zero for positions that point between nodes.
		*/
		get textOffset() {
			return this.pos - this.path[this.path.length - 1];
		}
		/**
		Get the node directly after the position, if any. If the position
		points into a text node, only the part of that node after the
		position is returned.
		*/
		get nodeAfter() {
			let parent = this.parent, index = this.index(this.depth);
			if (index == parent.childCount) return null;
			let dOff = this.pos - this.path[this.path.length - 1], child = parent.child(index);
			return dOff ? parent.child(index).cut(dOff) : child;
		}
		/**
		Get the node directly before the position, if any. If the
		position points into a text node, only the part of that node
		before the position is returned.
		*/
		get nodeBefore() {
			let index = this.index(this.depth);
			let dOff = this.pos - this.path[this.path.length - 1];
			if (dOff) return this.parent.child(index).cut(0, dOff);
			return index == 0 ? null : this.parent.child(index - 1);
		}
		/**
		Get the position at the given index in the parent node at the
		given depth (which defaults to `this.depth`).
		*/
		posAtIndex(index, depth) {
			depth = this.resolveDepth(depth);
			let node = this.path[depth * 3], pos = depth == 0 ? 0 : this.path[depth * 3 - 1] + 1;
			for (let i = 0; i < index; i++) pos += node.child(i).nodeSize;
			return pos;
		}
		/**
		Get the marks at this position, factoring in the surrounding
		marks' [`inclusive`](https://prosemirror.net/docs/ref/#model.MarkSpec.inclusive) property. If the
		position is at the start of a non-empty node, the marks of the
		node after it (if any) are returned.
		*/
		marks() {
			let parent = this.parent, index = this.index();
			if (parent.content.size == 0) return Mark.none;
			if (this.textOffset) return parent.child(index).marks;
			let main = parent.maybeChild(index - 1), other = parent.maybeChild(index);
			if (!main) {
				let tmp = main;
				main = other;
				other = tmp;
			}
			let marks = main.marks;
			for (var i = 0; i < marks.length; i++) if (marks[i].type.spec.inclusive === false && (!other || !marks[i].isInSet(other.marks))) marks = marks[i--].removeFromSet(marks);
			return marks;
		}
		/**
		Get the marks after the current position, if any, except those
		that are non-inclusive and not present at position `$end`. This
		is mostly useful for getting the set of marks to preserve after a
		deletion. Will return `null` if this position is at the end of
		its parent node or its parent node isn't a textblock (in which
		case no marks should be preserved).
		*/
		marksAcross($end) {
			let after = this.parent.maybeChild(this.index());
			if (!after || !after.isInline) return null;
			let marks = after.marks, next = $end.parent.maybeChild($end.index());
			for (var i = 0; i < marks.length; i++) if (marks[i].type.spec.inclusive === false && (!next || !marks[i].isInSet(next.marks))) marks = marks[i--].removeFromSet(marks);
			return marks;
		}
		/**
		The depth up to which this position and the given (non-resolved)
		position share the same parent nodes.
		*/
		sharedDepth(pos) {
			for (let depth = this.depth; depth > 0; depth--) if (this.start(depth) <= pos && this.end(depth) >= pos) return depth;
			return 0;
		}
		/**
		Returns a range based on the place where this position and the
		given position diverge around block content. If both point into
		the same textblock, for example, a range around that textblock
		will be returned. If they point into different blocks, the range
		around those blocks in their shared ancestor is returned. You can
		pass in an optional predicate that will be called with a parent
		node to see if a range into that parent is acceptable.
		*/
		blockRange(other = this, pred) {
			if (other.pos < this.pos) return other.blockRange(this);
			for (let d = this.depth - (this.parent.inlineContent || this.pos == other.pos ? 1 : 0); d >= 0; d--) if (other.pos <= this.end(d) && (!pred || pred(this.node(d)))) return new NodeRange(this, other, d);
			return null;
		}
		/**
		Query whether the given position shares the same parent node.
		*/
		sameParent(other) {
			return this.pos - this.parentOffset == other.pos - other.parentOffset;
		}
		/**
		Return the greater of this and the given position.
		*/
		max(other) {
			return other.pos > this.pos ? other : this;
		}
		/**
		Return the smaller of this and the given position.
		*/
		min(other) {
			return other.pos < this.pos ? other : this;
		}
		/**
		@internal
		*/
		toString() {
			let str = "";
			for (let i = 1; i <= this.depth; i++) str += (str ? "/" : "") + this.node(i).type.name + "_" + this.index(i - 1);
			return str + ":" + this.parentOffset;
		}
		/**
		@internal
		*/
		static resolve(doc, pos) {
			if (!(pos >= 0 && pos <= doc.content.size)) throw new RangeError("Position " + pos + " out of range");
			let path = [];
			let start = 0, parentOffset = pos;
			for (let node = doc;;) {
				let { index, offset } = node.content.findIndex(parentOffset);
				let rem = parentOffset - offset;
				path.push(node, index, start + offset);
				if (!rem) break;
				node = node.child(index);
				if (node.isText) break;
				parentOffset = rem - 1;
				start += offset + 1;
			}
			return new ResolvedPos(pos, path, parentOffset);
		}
		/**
		@internal
		*/
		static resolveCached(doc, pos) {
			let cache = resolveCache.get(doc);
			if (cache) for (let i = 0; i < cache.elts.length; i++) {
				let elt = cache.elts[i];
				if (elt.pos == pos) return elt;
			}
			else resolveCache.set(doc, cache = new ResolveCache());
			let result = cache.elts[cache.i] = ResolvedPos.resolve(doc, pos);
			cache.i = (cache.i + 1) % resolveCacheSize;
			return result;
		}
	};
	var ResolveCache = class {
		constructor() {
			this.elts = [];
			this.i = 0;
		}
	};
	var resolveCacheSize = 12, resolveCache = /* @__PURE__ */ new WeakMap();
	/**
	Represents a flat range of content, i.e. one that starts and
	ends in the same node.
	*/
	var NodeRange = class {
		/**
		Construct a node range. `$from` and `$to` should point into the
		same node until at least the given `depth`, since a node range
		denotes an adjacent set of nodes in a single parent node.
		*/
		constructor($from, $to, depth) {
			this.$from = $from;
			this.$to = $to;
			this.depth = depth;
		}
		/**
		The position at the start of the range.
		*/
		get start() {
			return this.$from.before(this.depth + 1);
		}
		/**
		The position at the end of the range.
		*/
		get end() {
			return this.$to.after(this.depth + 1);
		}
		/**
		The parent node that the range points into.
		*/
		get parent() {
			return this.$from.node(this.depth);
		}
		/**
		The start index of the range in the parent node.
		*/
		get startIndex() {
			return this.$from.index(this.depth);
		}
		/**
		The end index of the range in the parent node.
		*/
		get endIndex() {
			return this.$to.indexAfter(this.depth);
		}
	};
	var emptyAttrs = Object.create(null);
	/**
	This class represents a node in the tree that makes up a
	ProseMirror document. So a document is an instance of `Node`, with
	children that are also instances of `Node`.
	
	Nodes are persistent data structures. Instead of changing them, you
	create new ones with the content you want. Old ones keep pointing
	at the old document shape. This is made cheaper by sharing
	structure between the old and new data as much as possible, which a
	tree shape like this (without back pointers) makes easy.
	
	**Do not** directly mutate the properties of a `Node` object. See
	[the guide](https://prosemirror.net/docs/guide/#doc) for more information.
	*/
	var Node = class Node {
		/**
		@internal
		*/
		constructor(type, attrs, content, marks = Mark.none) {
			this.type = type;
			this.attrs = attrs;
			this.marks = marks;
			this.content = content || Fragment.empty;
		}
		/**
		The array of this node's child nodes.
		*/
		get children() {
			return this.content.content;
		}
		/**
		The size of this node, as defined by the integer-based [indexing
		scheme](https://prosemirror.net/docs/guide/#doc.indexing). For text nodes, this is the
		amount of characters. For other leaf nodes, it is one. For
		non-leaf nodes, it is the size of the content plus two (the
		start and end token).
		*/
		get nodeSize() {
			return this.isLeaf ? 1 : 2 + this.content.size;
		}
		/**
		The number of children that the node has.
		*/
		get childCount() {
			return this.content.childCount;
		}
		/**
		Get the child node at the given index. Raises an error when the
		index is out of range.
		*/
		child(index) {
			return this.content.child(index);
		}
		/**
		Get the child node at the given index, if it exists.
		*/
		maybeChild(index) {
			return this.content.maybeChild(index);
		}
		/**
		Call `f` for every child node, passing the node, its offset
		into this parent node, and its index.
		*/
		forEach(f) {
			this.content.forEach(f);
		}
		/**
		Invoke a callback for all descendant nodes recursively overlapping
		the given two positions that are relative to start of this
		node's content. This includes all ancestors of the nodes
		containing the two positions. The callback is invoked with the
		node, its position relative to the original node (method receiver),
		its parent node, and its child index. When the callback returns
		false for a given node, that node's children will not be
		recursed over. The last parameter can be used to specify a
		starting position to count from.
		*/
		nodesBetween(from, to, f, startPos = 0) {
			this.content.nodesBetween(from, to, f, startPos, this);
		}
		/**
		Call the given callback for every descendant node. Doesn't
		descend into a node when the callback returns `false`.
		*/
		descendants(f) {
			this.nodesBetween(0, this.content.size, f);
		}
		/**
		Concatenates all the text nodes found in this fragment and its
		children.
		*/
		get textContent() {
			return this.isLeaf && this.type.spec.leafText ? this.type.spec.leafText(this) : this.textBetween(0, this.content.size, "");
		}
		/**
		Get all text between positions `from` and `to`. When
		`blockSeparator` is given, it will be inserted to separate text
		from different block nodes. If `leafText` is given, it'll be
		inserted for every non-text leaf node encountered, otherwise
		[`leafText`](https://prosemirror.net/docs/ref/#model.NodeSpec.leafText) will be used.
		*/
		textBetween(from, to, blockSeparator, leafText) {
			return this.content.textBetween(from, to, blockSeparator, leafText);
		}
		/**
		Returns this node's first child, or `null` if there are no
		children.
		*/
		get firstChild() {
			return this.content.firstChild;
		}
		/**
		Returns this node's last child, or `null` if there are no
		children.
		*/
		get lastChild() {
			return this.content.lastChild;
		}
		/**
		Test whether two nodes represent the same piece of document.
		*/
		eq(other) {
			return this == other || this.sameMarkup(other) && this.content.eq(other.content);
		}
		/**
		Compare the markup (type, attributes, and marks) of this node to
		those of another. Returns `true` if both have the same markup.
		*/
		sameMarkup(other) {
			return this.hasMarkup(other.type, other.attrs, other.marks);
		}
		/**
		Check whether this node's markup correspond to the given type,
		attributes, and marks.
		*/
		hasMarkup(type, attrs, marks) {
			return this.type == type && compareDeep(this.attrs, attrs || type.defaultAttrs || emptyAttrs) && Mark.sameSet(this.marks, marks || Mark.none);
		}
		/**
		Create a new node with the same markup as this node, containing
		the given content (or empty, if no content is given).
		*/
		copy(content = null) {
			if (content == this.content) return this;
			return new Node(this.type, this.attrs, content, this.marks);
		}
		/**
		Create a copy of this node, with the given set of marks instead
		of the node's own marks.
		*/
		mark(marks) {
			return marks == this.marks ? this : new Node(this.type, this.attrs, this.content, marks);
		}
		/**
		Create a copy of this node with only the content between the
		given positions. If `to` is not given, it defaults to the end of
		the node.
		*/
		cut(from, to = this.content.size) {
			if (from == 0 && to == this.content.size) return this;
			return this.copy(this.content.cut(from, to));
		}
		/**
		Cut out the part of the document between the given positions, and
		return it as a `Slice` object.
		*/
		slice(from, to = this.content.size, includeParents = false) {
			if (from == to) return Slice.empty;
			let $from = this.resolve(from), $to = this.resolve(to);
			let depth = includeParents ? 0 : $from.sharedDepth(to);
			let start = $from.start(depth);
			return new Slice($from.node(depth).content.cut($from.pos - start, $to.pos - start), $from.depth - depth, $to.depth - depth);
		}
		/**
		Replace the part of the document between the given positions with
		the given slice. The slice must 'fit', meaning its open sides
		must be able to connect to the surrounding content, and its
		content nodes must be valid children for the node they are placed
		into. If any of this is violated, an error of type
		[`ReplaceError`](https://prosemirror.net/docs/ref/#model.ReplaceError) is thrown.
		*/
		replace(from, to, slice) {
			return replace(this.resolve(from), this.resolve(to), slice);
		}
		/**
		Find the node directly after the given position.
		*/
		nodeAt(pos) {
			for (let node = this;;) {
				let { index, offset } = node.content.findIndex(pos);
				node = node.maybeChild(index);
				if (!node) return null;
				if (offset == pos || node.isText) return node;
				pos -= offset + 1;
			}
		}
		/**
		Find the (direct) child node after the given offset, if any,
		and return it along with its index and offset relative to this
		node.
		*/
		childAfter(pos) {
			let { index, offset } = this.content.findIndex(pos);
			return {
				node: this.content.maybeChild(index),
				index,
				offset
			};
		}
		/**
		Find the (direct) child node before the given offset, if any,
		and return it along with its index and offset relative to this
		node.
		*/
		childBefore(pos) {
			if (pos == 0) return {
				node: null,
				index: 0,
				offset: 0
			};
			let { index, offset } = this.content.findIndex(pos);
			if (offset < pos) return {
				node: this.content.child(index),
				index,
				offset
			};
			let node = this.content.child(index - 1);
			return {
				node,
				index: index - 1,
				offset: offset - node.nodeSize
			};
		}
		/**
		Resolve the given position in the document, returning an
		[object](https://prosemirror.net/docs/ref/#model.ResolvedPos) with information about its context.
		*/
		resolve(pos) {
			return ResolvedPos.resolveCached(this, pos);
		}
		/**
		@internal
		*/
		resolveNoCache(pos) {
			return ResolvedPos.resolve(this, pos);
		}
		/**
		Test whether a given mark or mark type occurs in this document
		between the two given positions.
		*/
		rangeHasMark(from, to, type) {
			let found = false;
			if (to > from) this.nodesBetween(from, to, (node) => {
				if (type.isInSet(node.marks)) found = true;
				return !found;
			});
			return found;
		}
		/**
		True when this is a block (non-inline node)
		*/
		get isBlock() {
			return this.type.isBlock;
		}
		/**
		True when this is a textblock node, a block node with inline
		content.
		*/
		get isTextblock() {
			return this.type.isTextblock;
		}
		/**
		True when this node allows inline content.
		*/
		get inlineContent() {
			return this.type.inlineContent;
		}
		/**
		True when this is an inline node (a text node or a node that can
		appear among text).
		*/
		get isInline() {
			return this.type.isInline;
		}
		/**
		True when this is a text node.
		*/
		get isText() {
			return this.type.isText;
		}
		/**
		True when this is a leaf node.
		*/
		get isLeaf() {
			return this.type.isLeaf;
		}
		/**
		True when this is an atom, i.e. when it does not have directly
		editable content. This is usually the same as `isLeaf`, but can
		be configured with the [`atom` property](https://prosemirror.net/docs/ref/#model.NodeSpec.atom)
		on a node's spec (typically used when the node is displayed as
		an uneditable [node view](https://prosemirror.net/docs/ref/#view.NodeView)).
		*/
		get isAtom() {
			return this.type.isAtom;
		}
		/**
		Return a string representation of this node for debugging
		purposes.
		*/
		toString() {
			if (this.type.spec.toDebugString) return this.type.spec.toDebugString(this);
			let name = this.type.name;
			if (this.content.size) name += "(" + this.content.toStringInner() + ")";
			return wrapMarks(this.marks, name);
		}
		/**
		Get the content match in this node at the given index.
		*/
		contentMatchAt(index) {
			let match = this.type.contentMatch.matchFragment(this.content, 0, index);
			if (!match) throw new Error("Called contentMatchAt on a node with invalid content");
			return match;
		}
		/**
		Test whether replacing the range between `from` and `to` (by
		child index) with the given replacement fragment (which defaults
		to the empty fragment) would leave the node's content valid. You
		can optionally pass `start` and `end` indices into the
		replacement fragment.
		*/
		canReplace(from, to, replacement = Fragment.empty, start = 0, end = replacement.childCount) {
			let one = this.contentMatchAt(from).matchFragment(replacement, start, end);
			let two = one && one.matchFragment(this.content, to);
			if (!two || !two.validEnd) return false;
			for (let i = start; i < end; i++) if (!this.type.allowsMarks(replacement.child(i).marks)) return false;
			return true;
		}
		/**
		Test whether replacing the range `from` to `to` (by index) with
		a node of the given type would leave the node's content valid.
		*/
		canReplaceWith(from, to, type, marks) {
			if (marks && !this.type.allowsMarks(marks)) return false;
			let start = this.contentMatchAt(from).matchType(type);
			let end = start && start.matchFragment(this.content, to);
			return end ? end.validEnd : false;
		}
		/**
		Test whether the given node's content could be appended to this
		node. If that node is empty, this will only return true if there
		is at least one node type that can appear in both nodes (to avoid
		merging completely incompatible nodes).
		*/
		canAppend(other) {
			if (other.content.size) return this.canReplace(this.childCount, this.childCount, other.content);
			else return this.type.compatibleContent(other.type);
		}
		/**
		Check whether this node and its descendants conform to the
		schema, and raise an exception when they do not.
		*/
		check() {
			this.type.checkContent(this.content);
			this.type.checkAttrs(this.attrs);
			let copy = Mark.none;
			for (let i = 0; i < this.marks.length; i++) {
				let mark = this.marks[i];
				mark.type.checkAttrs(mark.attrs);
				copy = mark.addToSet(copy);
			}
			if (!Mark.sameSet(copy, this.marks)) throw new RangeError(`Invalid collection of marks for node ${this.type.name}: ${this.marks.map((m) => m.type.name)}`);
			this.content.forEach((node) => node.check());
		}
		/**
		Return a JSON-serializeable representation of this node.
		*/
		toJSON() {
			let obj = { type: this.type.name };
			for (let _ in this.attrs) {
				obj.attrs = this.attrs;
				break;
			}
			if (this.content.size) obj.content = this.content.toJSON();
			if (this.marks.length) obj.marks = this.marks.map((n) => n.toJSON());
			return obj;
		}
		/**
		Deserialize a node from its JSON representation.
		*/
		static fromJSON(schema, json) {
			if (!json) throw new RangeError("Invalid input for Node.fromJSON");
			let marks = void 0;
			if (json.marks) {
				if (!Array.isArray(json.marks)) throw new RangeError("Invalid mark data for Node.fromJSON");
				marks = json.marks.map(schema.markFromJSON);
			}
			if (json.type == "text") {
				if (typeof json.text != "string") throw new RangeError("Invalid text node in JSON");
				return schema.text(json.text, marks);
			}
			let content = Fragment.fromJSON(schema, json.content);
			let node = schema.nodeType(json.type).create(json.attrs, content, marks);
			node.type.checkAttrs(node.attrs);
			return node;
		}
	};
	Node.prototype.text = void 0;
	var TextNode = class TextNode extends Node {
		/**
		@internal
		*/
		constructor(type, attrs, content, marks) {
			super(type, attrs, null, marks);
			if (!content) throw new RangeError("Empty text nodes are not allowed");
			this.text = content;
		}
		toString() {
			if (this.type.spec.toDebugString) return this.type.spec.toDebugString(this);
			return wrapMarks(this.marks, JSON.stringify(this.text));
		}
		get textContent() {
			return this.text;
		}
		textBetween(from, to) {
			return this.text.slice(from, to);
		}
		get nodeSize() {
			return this.text.length;
		}
		mark(marks) {
			return marks == this.marks ? this : new TextNode(this.type, this.attrs, this.text, marks);
		}
		withText(text) {
			if (text == this.text) return this;
			return new TextNode(this.type, this.attrs, text, this.marks);
		}
		cut(from = 0, to = this.text.length) {
			if (from == 0 && to == this.text.length) return this;
			return this.withText(this.text.slice(from, to));
		}
		eq(other) {
			return this.sameMarkup(other) && this.text == other.text;
		}
		toJSON() {
			let base = super.toJSON();
			base.text = this.text;
			return base;
		}
	};
	function wrapMarks(marks, str) {
		for (let i = marks.length - 1; i >= 0; i--) str = marks[i].type.name + "(" + str + ")";
		return str;
	}
	/**
	Instances of this class represent a match state of a node type's
	[content expression](https://prosemirror.net/docs/ref/#model.NodeSpec.content), and can be used to
	find out whether further content matches here, and whether a given
	position is a valid end of the node.
	*/
	var ContentMatch = class ContentMatch {
		/**
		@internal
		*/
		constructor(validEnd) {
			this.validEnd = validEnd;
			/**
			@internal
			*/
			this.next = [];
			/**
			@internal
			*/
			this.wrapCache = [];
		}
		/**
		@internal
		*/
		static parse(string, nodeTypes) {
			let stream = new TokenStream(string, nodeTypes);
			if (stream.next == null) return ContentMatch.empty;
			let expr = parseExpr(stream);
			if (stream.next) stream.err("Unexpected trailing text");
			let match = dfa(nfa(expr));
			checkForDeadEnds(match, stream);
			return match;
		}
		/**
		Match a node type, returning a match after that node if
		successful.
		*/
		matchType(type) {
			for (let i = 0; i < this.next.length; i++) if (this.next[i].type == type) return this.next[i].next;
			return null;
		}
		/**
		Try to match a fragment. Returns the resulting match when
		successful.
		*/
		matchFragment(frag, start = 0, end = frag.childCount) {
			let cur = this;
			for (let i = start; cur && i < end; i++) cur = cur.matchType(frag.child(i).type);
			return cur;
		}
		/**
		@internal
		*/
		get inlineContent() {
			return this.next.length != 0 && this.next[0].type.isInline;
		}
		/**
		Get the first matching node type at this match position that can
		be generated.
		*/
		get defaultType() {
			for (let i = 0; i < this.next.length; i++) {
				let { type } = this.next[i];
				if (!(type.isText || type.hasRequiredAttrs())) return type;
			}
			return null;
		}
		/**
		@internal
		*/
		compatible(other) {
			for (let i = 0; i < this.next.length; i++) for (let j = 0; j < other.next.length; j++) if (this.next[i].type == other.next[j].type) return true;
			return false;
		}
		/**
		Try to match the given fragment, and if that fails, see if it can
		be made to match by inserting nodes in front of it. When
		successful, return a fragment of inserted nodes (which may be
		empty if nothing had to be inserted). When `toEnd` is true, only
		return a fragment if the resulting match goes to the end of the
		content expression.
		*/
		fillBefore(after, toEnd = false, startIndex = 0) {
			let seen = [this];
			function search(match, types) {
				let finished = match.matchFragment(after, startIndex);
				if (finished && (!toEnd || finished.validEnd)) return Fragment.from(types.map((tp) => tp.createAndFill()));
				for (let i = 0; i < match.next.length; i++) {
					let { type, next } = match.next[i];
					if (!(type.isText || type.hasRequiredAttrs()) && seen.indexOf(next) == -1) {
						seen.push(next);
						let found = search(next, types.concat(type));
						if (found) return found;
					}
				}
				return null;
			}
			return search(this, []);
		}
		/**
		Find a set of wrapping node types that would allow a node of the
		given type to appear at this position. The result may be empty
		(when it fits directly) and will be null when no such wrapping
		exists.
		*/
		findWrapping(target) {
			for (let i = 0; i < this.wrapCache.length; i += 2) if (this.wrapCache[i] == target) return this.wrapCache[i + 1];
			let computed = this.computeWrapping(target);
			this.wrapCache.push(target, computed);
			return computed;
		}
		/**
		@internal
		*/
		computeWrapping(target) {
			let seen = Object.create(null), active = [{
				match: this,
				type: null,
				via: null
			}];
			while (active.length) {
				let current = active.shift(), match = current.match;
				if (match.matchType(target)) {
					let result = [];
					for (let obj = current; obj.type; obj = obj.via) result.push(obj.type);
					return result.reverse();
				}
				for (let i = 0; i < match.next.length; i++) {
					let { type, next } = match.next[i];
					if (!type.isLeaf && !type.hasRequiredAttrs() && !(type.name in seen) && (!current.type || next.validEnd)) {
						active.push({
							match: type.contentMatch,
							type,
							via: current
						});
						seen[type.name] = true;
					}
				}
			}
			return null;
		}
		/**
		The number of outgoing edges this node has in the finite
		automaton that describes the content expression.
		*/
		get edgeCount() {
			return this.next.length;
		}
		/**
		Get the _n_​th outgoing edge from this node in the finite
		automaton that describes the content expression.
		*/
		edge(n) {
			if (n >= this.next.length) throw new RangeError(`There's no ${n}th edge in this content match`);
			return this.next[n];
		}
		/**
		@internal
		*/
		toString() {
			let seen = [];
			function scan(m) {
				seen.push(m);
				for (let i = 0; i < m.next.length; i++) if (seen.indexOf(m.next[i].next) == -1) scan(m.next[i].next);
			}
			scan(this);
			return seen.map((m, i) => {
				let out = i + (m.validEnd ? "*" : " ") + " ";
				for (let i = 0; i < m.next.length; i++) out += (i ? ", " : "") + m.next[i].type.name + "->" + seen.indexOf(m.next[i].next);
				return out;
			}).join("\n");
		}
	};
	/**
	@internal
	*/
	ContentMatch.empty = new ContentMatch(true);
	var TokenStream = class {
		constructor(string, nodeTypes) {
			this.string = string;
			this.nodeTypes = nodeTypes;
			this.inline = null;
			this.pos = 0;
			this.tokens = string.split(/\s*(?=\b|\W|$)/);
			if (this.tokens[this.tokens.length - 1] == "") this.tokens.pop();
			if (this.tokens[0] == "") this.tokens.shift();
		}
		get next() {
			return this.tokens[this.pos];
		}
		eat(tok) {
			return this.next == tok && (this.pos++ || true);
		}
		err(str) {
			throw new SyntaxError(str + " (in content expression '" + this.string + "')");
		}
	};
	function parseExpr(stream) {
		let exprs = [];
		do
			exprs.push(parseExprSeq(stream));
		while (stream.eat("|"));
		return exprs.length == 1 ? exprs[0] : {
			type: "choice",
			exprs
		};
	}
	function parseExprSeq(stream) {
		let exprs = [];
		do
			exprs.push(parseExprSubscript(stream));
		while (stream.next && stream.next != ")" && stream.next != "|");
		return exprs.length == 1 ? exprs[0] : {
			type: "seq",
			exprs
		};
	}
	function parseExprSubscript(stream) {
		let expr = parseExprAtom(stream);
		for (;;) if (stream.eat("+")) expr = {
			type: "plus",
			expr
		};
		else if (stream.eat("*")) expr = {
			type: "star",
			expr
		};
		else if (stream.eat("?")) expr = {
			type: "opt",
			expr
		};
		else if (stream.eat("{")) expr = parseExprRange(stream, expr);
		else break;
		return expr;
	}
	function parseNum(stream) {
		if (/\D/.test(stream.next)) stream.err("Expected number, got '" + stream.next + "'");
		let result = Number(stream.next);
		stream.pos++;
		return result;
	}
	function parseExprRange(stream, expr) {
		let min = parseNum(stream), max = min;
		if (stream.eat(",")) if (stream.next != "}") max = parseNum(stream);
		else max = -1;
		if (!stream.eat("}")) stream.err("Unclosed braced range");
		return {
			type: "range",
			min,
			max,
			expr
		};
	}
	function resolveName(stream, name) {
		let types = stream.nodeTypes, type = types[name];
		if (type) return [type];
		let result = [];
		for (let typeName in types) {
			let type = types[typeName];
			if (type.isInGroup(name)) result.push(type);
		}
		if (result.length == 0) stream.err("No node type or group '" + name + "' found");
		return result;
	}
	function parseExprAtom(stream) {
		if (stream.eat("(")) {
			let expr = parseExpr(stream);
			if (!stream.eat(")")) stream.err("Missing closing paren");
			return expr;
		} else if (!/\W/.test(stream.next)) {
			let exprs = resolveName(stream, stream.next).map((type) => {
				if (stream.inline == null) stream.inline = type.isInline;
				else if (stream.inline != type.isInline) stream.err("Mixing inline and block content");
				return {
					type: "name",
					value: type
				};
			});
			stream.pos++;
			return exprs.length == 1 ? exprs[0] : {
				type: "choice",
				exprs
			};
		} else stream.err("Unexpected token '" + stream.next + "'");
	}
	function nfa(expr) {
		let nfa = [[]];
		connect(compile(expr, 0), node());
		return nfa;
		function node() {
			return nfa.push([]) - 1;
		}
		function edge(from, to, term) {
			let edge = {
				term,
				to
			};
			nfa[from].push(edge);
			return edge;
		}
		function connect(edges, to) {
			edges.forEach((edge) => edge.to = to);
		}
		function compile(expr, from) {
			if (expr.type == "choice") return expr.exprs.reduce((out, expr) => out.concat(compile(expr, from)), []);
			else if (expr.type == "seq") for (let i = 0;; i++) {
				let next = compile(expr.exprs[i], from);
				if (i == expr.exprs.length - 1) return next;
				connect(next, from = node());
			}
			else if (expr.type == "star") {
				let loop = node();
				edge(from, loop);
				connect(compile(expr.expr, loop), loop);
				return [edge(loop)];
			} else if (expr.type == "plus") {
				let loop = node();
				connect(compile(expr.expr, from), loop);
				connect(compile(expr.expr, loop), loop);
				return [edge(loop)];
			} else if (expr.type == "opt") return [edge(from)].concat(compile(expr.expr, from));
			else if (expr.type == "range") {
				let cur = from;
				for (let i = 0; i < expr.min; i++) {
					let next = node();
					connect(compile(expr.expr, cur), next);
					cur = next;
				}
				if (expr.max == -1) connect(compile(expr.expr, cur), cur);
				else for (let i = expr.min; i < expr.max; i++) {
					let next = node();
					edge(cur, next);
					connect(compile(expr.expr, cur), next);
					cur = next;
				}
				return [edge(cur)];
			} else if (expr.type == "name") return [edge(from, void 0, expr.value)];
			else throw new Error("Unknown expr type");
		}
	}
	function cmp(a, b) {
		return b - a;
	}
	function nullFrom(nfa, node) {
		let result = [];
		scan(node);
		return result.sort(cmp);
		function scan(node) {
			let edges = nfa[node];
			if (edges.length == 1 && !edges[0].term) return scan(edges[0].to);
			result.push(node);
			for (let i = 0; i < edges.length; i++) {
				let { term, to } = edges[i];
				if (!term && result.indexOf(to) == -1) scan(to);
			}
		}
	}
	function dfa(nfa) {
		let labeled = Object.create(null);
		return explore(nullFrom(nfa, 0));
		function explore(states) {
			let out = [];
			states.forEach((node) => {
				nfa[node].forEach(({ term, to }) => {
					if (!term) return;
					let set;
					for (let i = 0; i < out.length; i++) if (out[i][0] == term) set = out[i][1];
					nullFrom(nfa, to).forEach((node) => {
						if (!set) out.push([term, set = []]);
						if (set.indexOf(node) == -1) set.push(node);
					});
				});
			});
			let state = labeled[states.join(",")] = new ContentMatch(states.indexOf(nfa.length - 1) > -1);
			for (let i = 0; i < out.length; i++) {
				let states = out[i][1].sort(cmp);
				state.next.push({
					type: out[i][0],
					next: labeled[states.join(",")] || explore(states)
				});
			}
			return state;
		}
	}
	function checkForDeadEnds(match, stream) {
		for (let i = 0, work = [match]; i < work.length; i++) {
			let state = work[i], dead = !state.validEnd, nodes = [];
			for (let j = 0; j < state.next.length; j++) {
				let { type, next } = state.next[j];
				nodes.push(type.name);
				if (dead && !(type.isText || type.hasRequiredAttrs())) dead = false;
				if (work.indexOf(next) == -1) work.push(next);
			}
			if (dead) stream.err("Only non-generatable nodes (" + nodes.join(", ") + ") in a required position (see https://prosemirror.net/docs/guide/#generatable)");
		}
	}
	function defaultAttrs(attrs) {
		let defaults = Object.create(null);
		for (let attrName in attrs) {
			let attr = attrs[attrName];
			if (!attr.hasDefault) return null;
			defaults[attrName] = attr.default;
		}
		return defaults;
	}
	function computeAttrs(attrs, value) {
		let built = Object.create(null);
		for (let name in attrs) {
			let given = value && value[name];
			if (given === void 0) {
				let attr = attrs[name];
				if (attr.hasDefault) given = attr.default;
				else throw new RangeError("No value supplied for attribute " + name);
			}
			built[name] = given;
		}
		return built;
	}
	function checkAttrs(attrs, values, type, name) {
		for (let name in values) if (!(name in attrs)) throw new RangeError(`Unsupported attribute ${name} for ${type} of type ${name}`);
		for (let name in attrs) {
			let attr = attrs[name];
			if (attr.validate) attr.validate(values[name]);
		}
	}
	function initAttrs(typeName, attrs) {
		let result = Object.create(null);
		if (attrs) for (let name in attrs) result[name] = new Attribute(typeName, name, attrs[name]);
		return result;
	}
	/**
	Node types are objects allocated once per `Schema` and used to
	[tag](https://prosemirror.net/docs/ref/#model.Node.type) `Node` instances. They contain information
	about the node type, such as its name and what kind of node it
	represents.
	*/
	var NodeType$1 = class NodeType$1 {
		/**
		@internal
		*/
		constructor(name, schema, spec) {
			this.name = name;
			this.schema = schema;
			this.spec = spec;
			/**
			The set of marks allowed in this node. `null` means all marks
			are allowed.
			*/
			this.markSet = null;
			this.groups = spec.group ? spec.group.split(" ") : [];
			this.attrs = initAttrs(name, spec.attrs);
			this.defaultAttrs = defaultAttrs(this.attrs);
			this.contentMatch = null;
			this.inlineContent = null;
			this.isBlock = !(spec.inline || name == "text");
			this.isText = name == "text";
		}
		/**
		True if this is an inline type.
		*/
		get isInline() {
			return !this.isBlock;
		}
		/**
		True if this is a textblock type, a block that contains inline
		content.
		*/
		get isTextblock() {
			return this.isBlock && this.inlineContent;
		}
		/**
		True for node types that allow no content.
		*/
		get isLeaf() {
			return this.contentMatch == ContentMatch.empty;
		}
		/**
		True when this node is an atom, i.e. when it does not have
		directly editable content.
		*/
		get isAtom() {
			return this.isLeaf || !!this.spec.atom;
		}
		/**
		Return true when this node type is part of the given
		[group](https://prosemirror.net/docs/ref/#model.NodeSpec.group).
		*/
		isInGroup(group) {
			return this.groups.indexOf(group) > -1;
		}
		/**
		The node type's [whitespace](https://prosemirror.net/docs/ref/#model.NodeSpec.whitespace) option.
		*/
		get whitespace() {
			return this.spec.whitespace || (this.spec.code ? "pre" : "normal");
		}
		/**
		Tells you whether this node type has any required attributes.
		*/
		hasRequiredAttrs() {
			for (let n in this.attrs) if (this.attrs[n].isRequired) return true;
			return false;
		}
		/**
		Indicates whether this node allows some of the same content as
		the given node type.
		*/
		compatibleContent(other) {
			return this == other || this.contentMatch.compatible(other.contentMatch);
		}
		/**
		@internal
		*/
		computeAttrs(attrs) {
			if (!attrs && this.defaultAttrs) return this.defaultAttrs;
			else return computeAttrs(this.attrs, attrs);
		}
		/**
		Create a `Node` of this type. The given attributes are
		checked and defaulted (you can pass `null` to use the type's
		defaults entirely, if no required attributes exist). `content`
		may be a `Fragment`, a node, an array of nodes, or
		`null`. Similarly `marks` may be `null` to default to the empty
		set of marks.
		*/
		create(attrs = null, content, marks) {
			if (this.isText) throw new Error("NodeType.create can't construct text nodes");
			return new Node(this, this.computeAttrs(attrs), Fragment.from(content), Mark.setFrom(marks));
		}
		/**
		Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but check the given content
		against the node type's content restrictions, and throw an error
		if it doesn't match.
		*/
		createChecked(attrs = null, content, marks) {
			content = Fragment.from(content);
			this.checkContent(content);
			return new Node(this, this.computeAttrs(attrs), content, Mark.setFrom(marks));
		}
		/**
		Like [`create`](https://prosemirror.net/docs/ref/#model.NodeType.create), but see if it is
		necessary to add nodes to the start or end of the given fragment
		to make it fit the node. If no fitting wrapping can be found,
		return null. Note that, due to the fact that required nodes can
		always be created, this will always succeed if you pass null or
		`Fragment.empty` as content.
		*/
		createAndFill(attrs = null, content, marks) {
			attrs = this.computeAttrs(attrs);
			content = Fragment.from(content);
			if (content.size) {
				let before = this.contentMatch.fillBefore(content);
				if (!before) return null;
				content = before.append(content);
			}
			let matched = this.contentMatch.matchFragment(content);
			let after = matched && matched.fillBefore(Fragment.empty, true);
			if (!after) return null;
			return new Node(this, attrs, content.append(after), Mark.setFrom(marks));
		}
		/**
		Returns true if the given fragment is valid content for this node
		type.
		*/
		validContent(content) {
			let result = this.contentMatch.matchFragment(content);
			if (!result || !result.validEnd) return false;
			for (let i = 0; i < content.childCount; i++) if (!this.allowsMarks(content.child(i).marks)) return false;
			return true;
		}
		/**
		Throws a RangeError if the given fragment is not valid content for this
		node type.
		@internal
		*/
		checkContent(content) {
			if (!this.validContent(content)) throw new RangeError(`Invalid content for node ${this.name}: ${content.toString().slice(0, 50)}`);
		}
		/**
		@internal
		*/
		checkAttrs(attrs) {
			checkAttrs(this.attrs, attrs, "node", this.name);
		}
		/**
		Check whether the given mark type is allowed in this node.
		*/
		allowsMarkType(markType) {
			return this.markSet == null || this.markSet.indexOf(markType) > -1;
		}
		/**
		Test whether the given set of marks are allowed in this node.
		*/
		allowsMarks(marks) {
			if (this.markSet == null) return true;
			for (let i = 0; i < marks.length; i++) if (!this.allowsMarkType(marks[i].type)) return false;
			return true;
		}
		/**
		Removes the marks that are not allowed in this node from the given set.
		*/
		allowedMarks(marks) {
			if (this.markSet == null) return marks;
			let copy;
			for (let i = 0; i < marks.length; i++) if (!this.allowsMarkType(marks[i].type)) {
				if (!copy) copy = marks.slice(0, i);
			} else if (copy) copy.push(marks[i]);
			return !copy ? marks : copy.length ? copy : Mark.none;
		}
		/**
		@internal
		*/
		static compile(nodes, schema) {
			let result = Object.create(null);
			nodes.forEach((name, spec) => result[name] = new NodeType$1(name, schema, spec));
			let topType = schema.spec.topNode || "doc";
			if (!result[topType]) throw new RangeError("Schema is missing its top node type ('" + topType + "')");
			if (!result.text) throw new RangeError("Every schema needs a 'text' type");
			for (let _ in result.text.attrs) throw new RangeError("The text node type should not have attributes");
			return result;
		}
	};
	function validateType(typeName, attrName, type) {
		let types = type.split("|");
		return (value) => {
			let name = value === null ? "null" : typeof value;
			if (types.indexOf(name) < 0) throw new RangeError(`Expected value of type ${types} for attribute ${attrName} on type ${typeName}, got ${name}`);
		};
	}
	var Attribute = class {
		constructor(typeName, attrName, options) {
			this.hasDefault = Object.prototype.hasOwnProperty.call(options, "default");
			this.default = options.default;
			this.validate = typeof options.validate == "string" ? validateType(typeName, attrName, options.validate) : options.validate;
		}
		get isRequired() {
			return !this.hasDefault;
		}
	};
	/**
	Like nodes, marks (which are associated with nodes to signify
	things like emphasis or being part of a link) are
	[tagged](https://prosemirror.net/docs/ref/#model.Mark.type) with type objects, which are
	instantiated once per `Schema`.
	*/
	var MarkType = class MarkType {
		/**
		@internal
		*/
		constructor(name, rank, schema, spec) {
			this.name = name;
			this.rank = rank;
			this.schema = schema;
			this.spec = spec;
			this.attrs = initAttrs(name, spec.attrs);
			this.excluded = null;
			let defaults = defaultAttrs(this.attrs);
			this.instance = defaults ? new Mark(this, defaults) : null;
		}
		/**
		Create a mark of this type. `attrs` may be `null` or an object
		containing only some of the mark's attributes. The others, if
		they have defaults, will be added.
		*/
		create(attrs = null) {
			if (!attrs && this.instance) return this.instance;
			return new Mark(this, computeAttrs(this.attrs, attrs));
		}
		/**
		@internal
		*/
		static compile(marks, schema) {
			let result = Object.create(null), rank = 0;
			marks.forEach((name, spec) => result[name] = new MarkType(name, rank++, schema, spec));
			return result;
		}
		/**
		When there is a mark of this type in the given set, a new set
		without it is returned. Otherwise, the input set is returned.
		*/
		removeFromSet(set) {
			for (var i = 0; i < set.length; i++) if (set[i].type == this) {
				set = set.slice(0, i).concat(set.slice(i + 1));
				i--;
			}
			return set;
		}
		/**
		Tests whether there is a mark of this type in the given set.
		*/
		isInSet(set) {
			for (let i = 0; i < set.length; i++) if (set[i].type == this) return set[i];
		}
		/**
		@internal
		*/
		checkAttrs(attrs) {
			checkAttrs(this.attrs, attrs, "mark", this.name);
		}
		/**
		Queries whether a given mark type is
		[excluded](https://prosemirror.net/docs/ref/#model.MarkSpec.excludes) by this one.
		*/
		excludes(other) {
			return this.excluded.indexOf(other) > -1;
		}
	};
	/**
	A document schema. Holds [node](https://prosemirror.net/docs/ref/#model.NodeType) and [mark
	type](https://prosemirror.net/docs/ref/#model.MarkType) objects for the nodes and marks that may
	occur in conforming documents, and provides functionality for
	creating and deserializing such documents.
	
	When given, the type parameters provide the names of the nodes and
	marks in this schema.
	*/
	var Schema = class {
		/**
		Construct a schema from a schema [specification](https://prosemirror.net/docs/ref/#model.SchemaSpec).
		*/
		constructor(spec) {
			/**
			The [linebreak
			replacement](https://prosemirror.net/docs/ref/#model.NodeSpec.linebreakReplacement) node defined
			in this schema, if any.
			*/
			this.linebreakReplacement = null;
			/**
			An object for storing whatever values modules may want to
			compute and cache per schema. (If you want to store something
			in it, try to use property names unlikely to clash.)
			*/
			this.cached = Object.create(null);
			let instanceSpec = this.spec = {};
			for (let prop in spec) instanceSpec[prop] = spec[prop];
			instanceSpec.nodes = OrderedMap.from(spec.nodes), instanceSpec.marks = OrderedMap.from(spec.marks || {}), this.nodes = NodeType$1.compile(this.spec.nodes, this);
			this.marks = MarkType.compile(this.spec.marks, this);
			let contentExprCache = Object.create(null);
			for (let prop in this.nodes) {
				if (prop in this.marks) throw new RangeError(prop + " can not be both a node and a mark");
				let type = this.nodes[prop], contentExpr = type.spec.content || "", markExpr = type.spec.marks;
				type.contentMatch = contentExprCache[contentExpr] || (contentExprCache[contentExpr] = ContentMatch.parse(contentExpr, this.nodes));
				type.inlineContent = type.contentMatch.inlineContent;
				if (type.spec.linebreakReplacement) {
					if (this.linebreakReplacement) throw new RangeError("Multiple linebreak nodes defined");
					if (!type.isInline || !type.isLeaf) throw new RangeError("Linebreak replacement nodes must be inline leaf nodes");
					this.linebreakReplacement = type;
				}
				type.markSet = markExpr == "_" ? null : markExpr ? gatherMarks(this, markExpr.split(" ")) : markExpr == "" || !type.inlineContent ? [] : null;
			}
			for (let prop in this.marks) {
				let type = this.marks[prop], excl = type.spec.excludes;
				type.excluded = excl == null ? [type] : excl == "" ? [] : gatherMarks(this, excl.split(" "));
			}
			this.nodeFromJSON = (json) => Node.fromJSON(this, json);
			this.markFromJSON = (json) => Mark.fromJSON(this, json);
			this.topNodeType = this.nodes[this.spec.topNode || "doc"];
			this.cached.wrappings = Object.create(null);
		}
		/**
		Create a node in this schema. The `type` may be a string or a
		`NodeType` instance. Attributes will be extended with defaults,
		`content` may be a `Fragment`, `null`, a `Node`, or an array of
		nodes.
		*/
		node(type, attrs = null, content, marks) {
			if (typeof type == "string") type = this.nodeType(type);
			else if (!(type instanceof NodeType$1)) throw new RangeError("Invalid node type: " + type);
			else if (type.schema != this) throw new RangeError("Node type from different schema used (" + type.name + ")");
			return type.createChecked(attrs, content, marks);
		}
		/**
		Create a text node in the schema. Empty text nodes are not
		allowed.
		*/
		text(text, marks) {
			let type = this.nodes.text;
			return new TextNode(type, type.defaultAttrs, text, Mark.setFrom(marks));
		}
		/**
		Create a mark with the given type and attributes.
		*/
		mark(type, attrs) {
			if (typeof type == "string") type = this.marks[type];
			return type.create(attrs);
		}
		/**
		@internal
		*/
		nodeType(name) {
			let found = this.nodes[name];
			if (!found) throw new RangeError("Unknown node type: " + name);
			return found;
		}
	};
	function gatherMarks(schema, marks) {
		let found = [];
		for (let i = 0; i < marks.length; i++) {
			let name = marks[i], mark = schema.marks[name], ok = mark;
			if (mark) found.push(mark);
			else for (let prop in schema.marks) {
				let mark = schema.marks[prop];
				if (name == "_" || mark.spec.group && mark.spec.group.split(" ").indexOf(name) > -1) found.push(ok = mark);
			}
			if (!ok) throw new SyntaxError("Unknown mark type: '" + marks[i] + "'");
		}
		return found;
	}
	function isTagRule(rule) {
		return rule.tag != null;
	}
	function isStyleRule(rule) {
		return rule.style != null;
	}
	/**
	A DOM parser represents a strategy for parsing DOM content into a
	ProseMirror document conforming to a given schema. Its behavior is
	defined by an array of [rules](https://prosemirror.net/docs/ref/#model.ParseRule).
	*/
	var DOMParser = class DOMParser {
		/**
		Create a parser that targets the given schema, using the given
		parsing rules.
		*/
		constructor(schema, rules) {
			this.schema = schema;
			this.rules = rules;
			/**
			@internal
			*/
			this.tags = [];
			/**
			@internal
			*/
			this.styles = [];
			let matchedStyles = this.matchedStyles = [];
			rules.forEach((rule) => {
				if (isTagRule(rule)) this.tags.push(rule);
				else if (isStyleRule(rule)) {
					let prop = /[^=]*/.exec(rule.style)[0];
					if (matchedStyles.indexOf(prop) < 0) matchedStyles.push(prop);
					this.styles.push(rule);
				}
			});
			this.normalizeLists = !this.tags.some((r) => {
				if (!/^(ul|ol)\b/.test(r.tag) || !r.node) return false;
				let node = schema.nodes[r.node];
				return node.contentMatch.matchType(node);
			});
		}
		/**
		Parse a document from the content of a DOM node.
		*/
		parse(dom, options = {}) {
			let context = new ParseContext(this, options, false);
			context.addAll(dom, Mark.none, options.from, options.to);
			return context.finish();
		}
		/**
		Parses the content of the given DOM node, like
		[`parse`](https://prosemirror.net/docs/ref/#model.DOMParser.parse), and takes the same set of
		options. But unlike that method, which produces a whole node,
		this one returns a slice that is open at the sides, meaning that
		the schema constraints aren't applied to the start of nodes to
		the left of the input and the end of nodes at the end.
		*/
		parseSlice(dom, options = {}) {
			let context = new ParseContext(this, options, true);
			context.addAll(dom, Mark.none, options.from, options.to);
			return Slice.maxOpen(context.finish());
		}
		/**
		@internal
		*/
		matchTag(dom, context, after) {
			for (let i = after ? this.tags.indexOf(after) + 1 : 0; i < this.tags.length; i++) {
				let rule = this.tags[i];
				if (matches(dom, rule.tag) && (rule.namespace === void 0 || dom.namespaceURI == rule.namespace) && (!rule.context || context.matchesContext(rule.context))) {
					if (rule.getAttrs) {
						let result = rule.getAttrs(dom);
						if (result === false) continue;
						rule.attrs = result || void 0;
					}
					return rule;
				}
			}
		}
		/**
		@internal
		*/
		matchStyle(prop, value, context, after) {
			for (let i = after ? this.styles.indexOf(after) + 1 : 0; i < this.styles.length; i++) {
				let rule = this.styles[i], style = rule.style;
				if (style.indexOf(prop) != 0 || rule.context && !context.matchesContext(rule.context) || style.length > prop.length && (style.charCodeAt(prop.length) != 61 || style.slice(prop.length + 1) != value)) continue;
				if (rule.getAttrs) {
					let result = rule.getAttrs(value);
					if (result === false) continue;
					rule.attrs = result || void 0;
				}
				return rule;
			}
		}
		/**
		@internal
		*/
		static schemaRules(schema) {
			let result = [];
			function insert(rule) {
				let priority = rule.priority == null ? 50 : rule.priority, i = 0;
				for (; i < result.length; i++) {
					let next = result[i];
					if ((next.priority == null ? 50 : next.priority) < priority) break;
				}
				result.splice(i, 0, rule);
			}
			for (let name in schema.marks) {
				let rules = schema.marks[name].spec.parseDOM;
				if (rules) rules.forEach((rule) => {
					insert(rule = copy(rule));
					if (!(rule.mark || rule.ignore || rule.clearMark)) rule.mark = name;
				});
			}
			for (let name in schema.nodes) {
				let rules = schema.nodes[name].spec.parseDOM;
				if (rules) rules.forEach((rule) => {
					insert(rule = copy(rule));
					if (!(rule.node || rule.ignore || rule.mark)) rule.node = name;
				});
			}
			return result;
		}
		/**
		Construct a DOM parser using the parsing rules listed in a
		schema's [node specs](https://prosemirror.net/docs/ref/#model.NodeSpec.parseDOM), reordered by
		[priority](https://prosemirror.net/docs/ref/#model.GenericParseRule.priority).
		*/
		static fromSchema(schema) {
			return schema.cached.domParser || (schema.cached.domParser = new DOMParser(schema, DOMParser.schemaRules(schema)));
		}
	};
	var blockTags = {
		address: true,
		article: true,
		aside: true,
		blockquote: true,
		canvas: true,
		dd: true,
		div: true,
		dl: true,
		fieldset: true,
		figcaption: true,
		figure: true,
		footer: true,
		form: true,
		h1: true,
		h2: true,
		h3: true,
		h4: true,
		h5: true,
		h6: true,
		header: true,
		hgroup: true,
		hr: true,
		li: true,
		noscript: true,
		ol: true,
		output: true,
		p: true,
		pre: true,
		section: true,
		table: true,
		tfoot: true,
		ul: true
	};
	var ignoreTags = {
		head: true,
		noscript: true,
		object: true,
		script: true,
		style: true,
		title: true
	};
	var listTags = {
		ol: true,
		ul: true
	};
	var OPT_PRESERVE_WS = 1, OPT_PRESERVE_WS_FULL = 2, OPT_OPEN_LEFT = 4;
	function wsOptionsFor(type, preserveWhitespace, base) {
		if (preserveWhitespace != null) return (preserveWhitespace ? OPT_PRESERVE_WS : 0) | (preserveWhitespace === "full" ? OPT_PRESERVE_WS_FULL : 0);
		return type && type.whitespace == "pre" ? 3 : base & -5;
	}
	var NodeContext = class {
		constructor(type, attrs, marks, solid, match, options) {
			this.type = type;
			this.attrs = attrs;
			this.marks = marks;
			this.solid = solid;
			this.options = options;
			this.content = [];
			this.activeMarks = Mark.none;
			this.match = match || (options & OPT_OPEN_LEFT ? null : type.contentMatch);
		}
		findWrapping(node) {
			if (!this.match) {
				if (!this.type) return [];
				let fill = this.type.contentMatch.fillBefore(Fragment.from(node));
				if (fill) this.match = this.type.contentMatch.matchFragment(fill);
				else {
					let start = this.type.contentMatch, wrap;
					if (wrap = start.findWrapping(node.type)) {
						this.match = start;
						return wrap;
					} else return null;
				}
			}
			return this.match.findWrapping(node.type);
		}
		finish(openEnd) {
			if (!(this.options & OPT_PRESERVE_WS)) {
				let last = this.content[this.content.length - 1], m;
				if (last && last.isText && (m = /[ \t\r\n\u000c]+$/.exec(last.text))) {
					let text = last;
					if (last.text.length == m[0].length) this.content.pop();
					else this.content[this.content.length - 1] = text.withText(text.text.slice(0, text.text.length - m[0].length));
				}
			}
			let content = Fragment.from(this.content);
			if (!openEnd && this.match) content = content.append(this.match.fillBefore(Fragment.empty, true));
			return this.type ? this.type.create(this.attrs, content, this.marks) : content;
		}
		inlineContext(node) {
			if (this.type) return this.type.inlineContent;
			if (this.content.length) return this.content[0].isInline;
			return node.parentNode && !blockTags.hasOwnProperty(node.parentNode.nodeName.toLowerCase());
		}
	};
	var ParseContext = class {
		constructor(parser, options, isOpen) {
			this.parser = parser;
			this.options = options;
			this.isOpen = isOpen;
			this.open = 0;
			this.localPreserveWS = false;
			let topNode = options.topNode, topContext;
			let topOptions = wsOptionsFor(null, options.preserveWhitespace, 0) | (isOpen ? OPT_OPEN_LEFT : 0);
			if (topNode) topContext = new NodeContext(topNode.type, topNode.attrs, Mark.none, true, options.topMatch || topNode.type.contentMatch, topOptions);
			else if (isOpen) topContext = new NodeContext(null, null, Mark.none, true, null, topOptions);
			else topContext = new NodeContext(parser.schema.topNodeType, null, Mark.none, true, null, topOptions);
			this.nodes = [topContext];
			this.find = options.findPositions;
			this.needsBlock = false;
		}
		get top() {
			return this.nodes[this.open];
		}
		addDOM(dom, marks) {
			if (dom.nodeType == 3) this.addTextNode(dom, marks);
			else if (dom.nodeType == 1) this.addElement(dom, marks);
		}
		addTextNode(dom, marks) {
			let value = dom.nodeValue;
			let top = this.top, preserveWS = top.options & OPT_PRESERVE_WS_FULL ? "full" : this.localPreserveWS || (top.options & OPT_PRESERVE_WS) > 0;
			let { schema } = this.parser;
			if (preserveWS === "full" || top.inlineContext(dom) || /[^ \t\r\n\u000c]/.test(value)) {
				if (!preserveWS) {
					value = value.replace(/[ \t\r\n\u000c]+/g, " ");
					if (/^[ \t\r\n\u000c]/.test(value) && this.open == this.nodes.length - 1) {
						let nodeBefore = top.content[top.content.length - 1];
						let domNodeBefore = dom.previousSibling;
						if (!nodeBefore || domNodeBefore && domNodeBefore.nodeName == "BR" || nodeBefore.isText && /[ \t\r\n\u000c]$/.test(nodeBefore.text)) value = value.slice(1);
					}
				} else if (preserveWS === "full") value = value.replace(/\r\n?/g, "\n");
				else if (schema.linebreakReplacement && /[\r\n]/.test(value) && this.top.findWrapping(schema.linebreakReplacement.create())) {
					let lines = value.split(/\r?\n|\r/);
					for (let i = 0; i < lines.length; i++) {
						if (i) this.insertNode(schema.linebreakReplacement.create(), marks, true);
						if (lines[i]) this.insertNode(schema.text(lines[i]), marks, !/\S/.test(lines[i]));
					}
					value = "";
				} else value = value.replace(/\r?\n|\r/g, " ");
				if (value) this.insertNode(schema.text(value), marks, !/\S/.test(value));
				this.findInText(dom);
			} else this.findInside(dom);
		}
		addElement(dom, marks, matchAfter) {
			let outerWS = this.localPreserveWS, top = this.top;
			if (dom.tagName == "PRE" || /pre/.test(dom.style && dom.style.whiteSpace)) this.localPreserveWS = true;
			let name = dom.nodeName.toLowerCase(), ruleID;
			if (listTags.hasOwnProperty(name) && this.parser.normalizeLists) normalizeList(dom);
			let rule = this.options.ruleFromNode && this.options.ruleFromNode(dom) || (ruleID = this.parser.matchTag(dom, this, matchAfter));
			out: if (rule ? rule.ignore : ignoreTags.hasOwnProperty(name)) {
				this.findInside(dom);
				this.ignoreFallback(dom, marks);
			} else if (!rule || rule.skip || rule.closeParent) {
				if (rule && rule.closeParent) this.open = Math.max(0, this.open - 1);
				else if (rule && rule.skip.nodeType) dom = rule.skip;
				let sync, oldNeedsBlock = this.needsBlock;
				if (blockTags.hasOwnProperty(name)) {
					if (top.content.length && top.content[0].isInline && this.open) {
						this.open--;
						top = this.top;
					}
					sync = true;
					if (!top.type) this.needsBlock = true;
				} else if (!dom.firstChild) {
					this.leafFallback(dom, marks);
					break out;
				}
				let innerMarks = rule && rule.skip ? marks : this.readStyles(dom, marks);
				if (innerMarks) this.addAll(dom, innerMarks);
				if (sync) this.sync(top);
				this.needsBlock = oldNeedsBlock;
			} else {
				let innerMarks = this.readStyles(dom, marks);
				if (innerMarks) this.addElementByRule(dom, rule, innerMarks, rule.consuming === false ? ruleID : void 0);
			}
			this.localPreserveWS = outerWS;
		}
		leafFallback(dom, marks) {
			if (dom.nodeName == "BR" && this.top.type && this.top.type.inlineContent) this.addTextNode(dom.ownerDocument.createTextNode("\n"), marks);
		}
		ignoreFallback(dom, marks) {
			if (dom.nodeName == "BR" && (!this.top.type || !this.top.type.inlineContent)) this.findPlace(this.parser.schema.text("-"), marks, true);
		}
		readStyles(dom, marks) {
			let styles = dom.style;
			if (styles && styles.length) for (let i = 0; i < this.parser.matchedStyles.length; i++) {
				let name = this.parser.matchedStyles[i], value = styles.getPropertyValue(name);
				if (value) for (let after = void 0;;) {
					let rule = this.parser.matchStyle(name, value, this, after);
					if (!rule) break;
					if (rule.ignore) return null;
					if (rule.clearMark) marks = marks.filter((m) => !rule.clearMark(m));
					else marks = marks.concat(this.parser.schema.marks[rule.mark].create(rule.attrs));
					if (rule.consuming === false) after = rule;
					else break;
				}
			}
			return marks;
		}
		addElementByRule(dom, rule, marks, continueAfter) {
			let sync, nodeType;
			if (rule.node) {
				nodeType = this.parser.schema.nodes[rule.node];
				if (!nodeType.isLeaf) {
					let inner = this.enter(nodeType, rule.attrs || null, marks, rule.preserveWhitespace);
					if (inner) {
						sync = true;
						marks = inner;
					}
				} else if (!this.insertNode(nodeType.create(rule.attrs), marks, dom.nodeName == "BR")) this.leafFallback(dom, marks);
			} else {
				let markType = this.parser.schema.marks[rule.mark];
				marks = marks.concat(markType.create(rule.attrs));
			}
			let startIn = this.top;
			if (nodeType && nodeType.isLeaf) this.findInside(dom);
			else if (continueAfter) this.addElement(dom, marks, continueAfter);
			else if (rule.getContent) {
				this.findInside(dom);
				rule.getContent(dom, this.parser.schema).forEach((node) => this.insertNode(node, marks, false));
			} else {
				let contentDOM = dom;
				if (typeof rule.contentElement == "string") contentDOM = dom.querySelector(rule.contentElement);
				else if (typeof rule.contentElement == "function") contentDOM = rule.contentElement(dom);
				else if (rule.contentElement) contentDOM = rule.contentElement;
				this.findAround(dom, contentDOM, true);
				this.addAll(contentDOM, marks);
				this.findAround(dom, contentDOM, false);
			}
			if (sync && this.sync(startIn)) this.open--;
		}
		addAll(parent, marks, startIndex, endIndex) {
			let index = startIndex || 0;
			for (let dom = startIndex ? parent.childNodes[startIndex] : parent.firstChild, end = endIndex == null ? null : parent.childNodes[endIndex]; dom != end; dom = dom.nextSibling, ++index) {
				this.findAtPoint(parent, index);
				this.addDOM(dom, marks);
			}
			this.findAtPoint(parent, index);
		}
		findPlace(node, marks, cautious) {
			let route, sync;
			for (let depth = this.open, penalty = 0; depth >= 0; depth--) {
				let cx = this.nodes[depth];
				let found = cx.findWrapping(node);
				if (found && (!route || route.length > found.length + penalty)) {
					route = found;
					sync = cx;
					if (!found.length) break;
				}
				if (cx.solid) {
					if (cautious) break;
					penalty += 2;
				}
			}
			if (!route) return null;
			this.sync(sync);
			for (let i = 0; i < route.length; i++) marks = this.enterInner(route[i], null, marks, false);
			return marks;
		}
		insertNode(node, marks, cautious) {
			if (node.isInline && this.needsBlock && !this.top.type) {
				let block = this.textblockFromContext();
				if (block) marks = this.enterInner(block, null, marks);
			}
			let innerMarks = this.findPlace(node, marks, cautious);
			if (innerMarks) {
				this.closeExtra();
				let top = this.top;
				if (top.match) top.match = top.match.matchType(node.type);
				let nodeMarks = Mark.none;
				for (let m of innerMarks.concat(node.marks)) if (top.type ? top.type.allowsMarkType(m.type) : markMayApply(m.type, node.type)) nodeMarks = m.addToSet(nodeMarks);
				top.content.push(node.mark(nodeMarks));
				return true;
			}
			return false;
		}
		enter(type, attrs, marks, preserveWS) {
			let innerMarks = this.findPlace(type.create(attrs), marks, false);
			if (innerMarks) innerMarks = this.enterInner(type, attrs, marks, true, preserveWS);
			return innerMarks;
		}
		enterInner(type, attrs, marks, solid = false, preserveWS) {
			this.closeExtra();
			let top = this.top;
			top.match = top.match && top.match.matchType(type);
			let options = wsOptionsFor(type, preserveWS, top.options);
			if (top.options & OPT_OPEN_LEFT && top.content.length == 0) options |= OPT_OPEN_LEFT;
			let applyMarks = Mark.none;
			marks = marks.filter((m) => {
				if (top.type ? top.type.allowsMarkType(m.type) : markMayApply(m.type, type)) {
					applyMarks = m.addToSet(applyMarks);
					return false;
				}
				return true;
			});
			this.nodes.push(new NodeContext(type, attrs, applyMarks, solid, null, options));
			this.open++;
			return marks;
		}
		closeExtra(openEnd = false) {
			let i = this.nodes.length - 1;
			if (i > this.open) {
				for (; i > this.open; i--) this.nodes[i - 1].content.push(this.nodes[i].finish(openEnd));
				this.nodes.length = this.open + 1;
			}
		}
		finish() {
			this.open = 0;
			this.closeExtra(this.isOpen);
			return this.nodes[0].finish(!!(this.isOpen || this.options.topOpen));
		}
		sync(to) {
			for (let i = this.open; i >= 0; i--) if (this.nodes[i] == to) {
				this.open = i;
				return true;
			} else if (this.localPreserveWS) this.nodes[i].options |= OPT_PRESERVE_WS;
			return false;
		}
		get currentPos() {
			this.closeExtra();
			let pos = 0;
			for (let i = this.open; i >= 0; i--) {
				let content = this.nodes[i].content;
				for (let j = content.length - 1; j >= 0; j--) pos += content[j].nodeSize;
				if (i) pos++;
			}
			return pos;
		}
		findAtPoint(parent, offset) {
			if (this.find) {
				for (let i = 0; i < this.find.length; i++) if (this.find[i].node == parent && this.find[i].offset == offset) this.find[i].pos = this.currentPos;
			}
		}
		findInside(parent) {
			if (this.find) {
				for (let i = 0; i < this.find.length; i++) if (this.find[i].pos == null && parent.nodeType == 1 && parent.contains(this.find[i].node)) this.find[i].pos = this.currentPos;
			}
		}
		findAround(parent, content, before) {
			if (parent != content && this.find) {
				for (let i = 0; i < this.find.length; i++) if (this.find[i].pos == null && parent.nodeType == 1 && parent.contains(this.find[i].node)) {
					if (content.compareDocumentPosition(this.find[i].node) & (before ? 2 : 4)) this.find[i].pos = this.currentPos;
				}
			}
		}
		findInText(textNode) {
			if (this.find) {
				for (let i = 0; i < this.find.length; i++) if (this.find[i].node == textNode) this.find[i].pos = this.currentPos - (textNode.nodeValue.length - this.find[i].offset);
			}
		}
		matchesContext(context) {
			if (context.indexOf("|") > -1) return context.split(/\s*\|\s*/).some(this.matchesContext, this);
			let parts = context.split("/");
			let option = this.options.context;
			let useRoot = !this.isOpen && (!option || option.parent.type == this.nodes[0].type);
			let minDepth = -(option ? option.depth + 1 : 0) + (useRoot ? 0 : 1);
			let match = (i, depth) => {
				for (; i >= 0; i--) {
					let part = parts[i];
					if (part == "") {
						if (i == parts.length - 1 || i == 0) continue;
						for (; depth >= minDepth; depth--) if (match(i - 1, depth)) return true;
						return false;
					} else {
						let next = depth > 0 || depth == 0 && useRoot ? this.nodes[depth].type : option && depth >= minDepth ? option.node(depth - minDepth).type : null;
						if (!next || next.name != part && !next.isInGroup(part)) return false;
						depth--;
					}
				}
				return true;
			};
			return match(parts.length - 1, this.open);
		}
		textblockFromContext() {
			let $context = this.options.context;
			if ($context) for (let d = $context.depth; d >= 0; d--) {
				let deflt = $context.node(d).contentMatchAt($context.indexAfter(d)).defaultType;
				if (deflt && deflt.isTextblock && deflt.defaultAttrs) return deflt;
			}
			for (let name in this.parser.schema.nodes) {
				let type = this.parser.schema.nodes[name];
				if (type.isTextblock && type.defaultAttrs) return type;
			}
		}
	};
	function normalizeList(dom) {
		for (let child = dom.firstChild, prevItem = null; child; child = child.nextSibling) {
			let name = child.nodeType == 1 ? child.nodeName.toLowerCase() : null;
			if (name && listTags.hasOwnProperty(name) && prevItem) {
				prevItem.appendChild(child);
				child = prevItem;
			} else if (name == "li") prevItem = child;
			else if (name) prevItem = null;
		}
	}
	function matches(dom, selector) {
		return (dom.matches || dom.msMatchesSelector || dom.webkitMatchesSelector || dom.mozMatchesSelector).call(dom, selector);
	}
	function copy(obj) {
		let copy = {};
		for (let prop in obj) copy[prop] = obj[prop];
		return copy;
	}
	function markMayApply(markType, nodeType) {
		let nodes = nodeType.schema.nodes;
		for (let name in nodes) {
			let parent = nodes[name];
			if (!parent.allowsMarkType(markType)) continue;
			let seen = [], scan = (match) => {
				seen.push(match);
				for (let i = 0; i < match.edgeCount; i++) {
					let { type, next } = match.edge(i);
					if (type == nodeType) return true;
					if (seen.indexOf(next) < 0 && scan(next)) return true;
				}
			};
			if (scan(parent.contentMatch)) return true;
		}
	}
	/**
	A DOM serializer knows how to convert ProseMirror nodes and
	marks of various types to DOM nodes.
	*/
	var DOMSerializer = class DOMSerializer {
		/**
		Create a serializer. `nodes` should map node names to functions
		that take a node and return a description of the corresponding
		DOM. `marks` does the same for mark names, but also gets an
		argument that tells it whether the mark's content is block or
		inline content (for typical use, it'll always be inline). A mark
		serializer may be `null` to indicate that marks of that type
		should not be serialized.
		*/
		constructor(nodes, marks) {
			this.nodes = nodes;
			this.marks = marks;
		}
		/**
		Serialize the content of this fragment to a DOM fragment. When
		not in the browser, the `document` option, containing a DOM
		document, should be passed so that the serializer can create
		nodes.
		*/
		serializeFragment(fragment, options = {}, target) {
			if (!target) target = doc$1(options).createDocumentFragment();
			let top = target, active = [];
			fragment.forEach((node) => {
				if (active.length || node.marks.length) {
					let keep = 0, rendered = 0;
					while (keep < active.length && rendered < node.marks.length) {
						let next = node.marks[rendered];
						if (!this.marks[next.type.name]) {
							rendered++;
							continue;
						}
						if (!next.eq(active[keep][0]) || next.type.spec.spanning === false) break;
						keep++;
						rendered++;
					}
					while (keep < active.length) top = active.pop()[1];
					while (rendered < node.marks.length) {
						let add = node.marks[rendered++];
						let markDOM = this.serializeMark(add, node.isInline, options);
						if (markDOM) {
							active.push([add, top]);
							top.appendChild(markDOM.dom);
							top = markDOM.contentDOM || markDOM.dom;
						}
					}
				}
				top.appendChild(this.serializeNodeInner(node, options));
			});
			return target;
		}
		/**
		@internal
		*/
		serializeNodeInner(node, options) {
			if (node.isText) return doc$1(options).createTextNode(node.text);
			let { dom, contentDOM } = renderSpec(doc$1(options), this.nodes[node.type.name](node), null, node.attrs);
			if (contentDOM) {
				if (node.isLeaf) throw new RangeError("Content hole not allowed in a leaf node spec");
				this.serializeFragment(node.content, options, contentDOM);
			}
			return dom;
		}
		/**
		Serialize this node to a DOM node. This can be useful when you
		need to serialize a part of a document, as opposed to the whole
		document. To serialize a whole document, use
		[`serializeFragment`](https://prosemirror.net/docs/ref/#model.DOMSerializer.serializeFragment) on
		its [content](https://prosemirror.net/docs/ref/#model.Node.content).
		*/
		serializeNode(node, options = {}) {
			let dom = this.serializeNodeInner(node, options);
			for (let i = node.marks.length - 1; i >= 0; i--) {
				let wrap = this.serializeMark(node.marks[i], node.isInline, options);
				if (wrap) {
					(wrap.contentDOM || wrap.dom).appendChild(dom);
					dom = wrap.dom;
				}
			}
			return dom;
		}
		/**
		@internal
		*/
		serializeMark(mark, inline, options = {}) {
			let toDOM = this.marks[mark.type.name];
			return toDOM && renderSpec(doc$1(options), toDOM(mark, inline), null, mark.attrs);
		}
		static renderSpec(doc, structure, xmlNS = null, blockArraysIn) {
			if (typeof structure == "string") return { dom: doc.createTextNode(structure) };
			return renderSpec(doc, structure, xmlNS, blockArraysIn);
		}
		/**
		Build a serializer using the [`toDOM`](https://prosemirror.net/docs/ref/#model.NodeSpec.toDOM)
		properties in a schema's node and mark specs.
		*/
		static fromSchema(schema) {
			return schema.cached.domSerializer || (schema.cached.domSerializer = new DOMSerializer(this.nodesFromSchema(schema), this.marksFromSchema(schema)));
		}
		/**
		Gather the serializers in a schema's node specs into an object.
		This can be useful as a base to build a custom serializer from.
		*/
		static nodesFromSchema(schema) {
			let result = gatherToDOM(schema.nodes);
			if (!result.text) result.text = (node) => node.text;
			return result;
		}
		/**
		Gather the serializers in a schema's mark specs into an object.
		*/
		static marksFromSchema(schema) {
			return gatherToDOM(schema.marks);
		}
	};
	function gatherToDOM(obj) {
		let result = {};
		for (let name in obj) {
			let toDOM = obj[name].spec.toDOM;
			if (toDOM) result[name] = toDOM;
		}
		return result;
	}
	function doc$1(options) {
		return options.document || window.document;
	}
	var suspiciousAttributeCache = /* @__PURE__ */ new WeakMap();
	function suspiciousAttributes(attrs) {
		let value = suspiciousAttributeCache.get(attrs);
		if (value === void 0) suspiciousAttributeCache.set(attrs, value = suspiciousAttributesInner(attrs));
		return value;
	}
	function suspiciousAttributesInner(attrs) {
		let result = null;
		function scan(value) {
			if (value && typeof value == "object") if (Array.isArray(value)) if (typeof value[0] == "string") {
				if (!result) result = [];
				result.push(value);
			} else for (let i = 0; i < value.length; i++) scan(value[i]);
			else for (let prop in value) scan(value[prop]);
		}
		scan(attrs);
		return result;
	}
	function renderSpec(doc, structure, xmlNS, blockArraysIn) {
		if (structure.nodeType == 1) return { dom: structure };
		if (structure.dom && structure.dom.nodeType == 1) return structure;
		let tagName = structure[0], suspicious;
		if (typeof tagName != "string") throw new RangeError("Invalid array passed to renderSpec");
		if (blockArraysIn && (suspicious = suspiciousAttributes(blockArraysIn)) && suspicious.indexOf(structure) > -1) throw new RangeError("Using an array from an attribute object as a DOM spec. This may be an attempted cross site scripting attack.");
		let space = tagName.indexOf(" ");
		if (space > 0) {
			xmlNS = tagName.slice(0, space);
			tagName = tagName.slice(space + 1);
		}
		let contentDOM;
		let dom = xmlNS ? doc.createElementNS(xmlNS, tagName) : doc.createElement(tagName);
		let attrs = structure[1], start = 1;
		if (attrs && typeof attrs == "object" && attrs.nodeType == null && !Array.isArray(attrs)) {
			start = 2;
			for (let name in attrs) if (attrs[name] != null) {
				let space = name.indexOf(" ");
				if (space > 0) dom.setAttributeNS(name.slice(0, space), name.slice(space + 1), attrs[name]);
				else if (name == "style" && dom.style) dom.style.cssText = attrs[name];
				else dom.setAttribute(name, attrs[name]);
			}
		}
		for (let i = start; i < structure.length; i++) {
			let child = structure[i];
			if (child === 0) {
				if (i < structure.length - 1 || i > start) throw new RangeError("Content hole must be the only child of its parent node");
				return {
					dom,
					contentDOM: dom
				};
			} else if (typeof child == "string") dom.appendChild(doc.createTextNode(child));
			else {
				let { dom: inner, contentDOM: innerContent } = renderSpec(doc, child, xmlNS, blockArraysIn);
				dom.appendChild(inner);
				if (innerContent) {
					if (contentDOM) throw new RangeError("Multiple content holes");
					contentDOM = innerContent;
				}
			}
		}
		return {
			dom,
			contentDOM
		};
	}
	//#endregion
	//#region node_modules/prosemirror-transform/dist/index.js
	var lower16 = 65535;
	var factor16 = Math.pow(2, 16);
	function makeRecover(index, offset) {
		return index + offset * factor16;
	}
	function recoverIndex(value) {
		return value & lower16;
	}
	function recoverOffset(value) {
		return (value - (value & lower16)) / factor16;
	}
	var DEL_BEFORE = 1, DEL_AFTER = 2, DEL_ACROSS = 4, DEL_SIDE = 8;
	/**
	An object representing a mapped position with extra
	information.
	*/
	var MapResult = class {
		/**
		@internal
		*/
		constructor(pos, delInfo, recover) {
			this.pos = pos;
			this.delInfo = delInfo;
			this.recover = recover;
		}
		/**
		Tells you whether the position was deleted, that is, whether the
		step removed the token on the side queried (via the `assoc`)
		argument from the document.
		*/
		get deleted() {
			return (this.delInfo & DEL_SIDE) > 0;
		}
		/**
		Tells you whether the token before the mapped position was deleted.
		*/
		get deletedBefore() {
			return (this.delInfo & 5) > 0;
		}
		/**
		True when the token after the mapped position was deleted.
		*/
		get deletedAfter() {
			return (this.delInfo & 6) > 0;
		}
		/**
		Tells whether any of the steps mapped through deletes across the
		position (including both the token before and after the
		position).
		*/
		get deletedAcross() {
			return (this.delInfo & DEL_ACROSS) > 0;
		}
	};
	/**
	A map describing the deletions and insertions made by a step, which
	can be used to find the correspondence between positions in the
	pre-step version of a document and the same position in the
	post-step version.
	*/
	var StepMap = class StepMap {
		/**
		Create a position map. The modifications to the document are
		represented as an array of numbers, in which each group of three
		represents a modified chunk as `[start, oldSize, newSize]`.
		*/
		constructor(ranges, inverted = false) {
			this.ranges = ranges;
			this.inverted = inverted;
			if (!ranges.length && StepMap.empty) return StepMap.empty;
		}
		/**
		@internal
		*/
		recover(value) {
			let diff = 0, index = recoverIndex(value);
			if (!this.inverted) for (let i = 0; i < index; i++) diff += this.ranges[i * 3 + 2] - this.ranges[i * 3 + 1];
			return this.ranges[index * 3] + diff + recoverOffset(value);
		}
		mapResult(pos, assoc = 1) {
			return this._map(pos, assoc, false);
		}
		map(pos, assoc = 1) {
			return this._map(pos, assoc, true);
		}
		/**
		@internal
		*/
		_map(pos, assoc, simple) {
			let diff = 0, oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
			for (let i = 0; i < this.ranges.length; i += 3) {
				let start = this.ranges[i] - (this.inverted ? diff : 0);
				if (start > pos) break;
				let oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex], end = start + oldSize;
				if (pos <= end) {
					let side = !oldSize ? assoc : pos == start ? -1 : pos == end ? 1 : assoc;
					let result = start + diff + (side < 0 ? 0 : newSize);
					if (simple) return result;
					let recover = pos == (assoc < 0 ? start : end) ? null : makeRecover(i / 3, pos - start);
					let del = pos == start ? DEL_AFTER : pos == end ? DEL_BEFORE : DEL_ACROSS;
					if (assoc < 0 ? pos != start : pos != end) del |= DEL_SIDE;
					return new MapResult(result, del, recover);
				}
				diff += newSize - oldSize;
			}
			return simple ? pos + diff : new MapResult(pos + diff, 0, null);
		}
		/**
		@internal
		*/
		touches(pos, recover) {
			let diff = 0, index = recoverIndex(recover);
			let oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
			for (let i = 0; i < this.ranges.length; i += 3) {
				let start = this.ranges[i] - (this.inverted ? diff : 0);
				if (start > pos) break;
				let oldSize = this.ranges[i + oldIndex];
				if (pos <= start + oldSize && i == index * 3) return true;
				diff += this.ranges[i + newIndex] - oldSize;
			}
			return false;
		}
		/**
		Calls the given function on each of the changed ranges included in
		this map.
		*/
		forEach(f) {
			let oldIndex = this.inverted ? 2 : 1, newIndex = this.inverted ? 1 : 2;
			for (let i = 0, diff = 0; i < this.ranges.length; i += 3) {
				let start = this.ranges[i], oldStart = start - (this.inverted ? diff : 0), newStart = start + (this.inverted ? 0 : diff);
				let oldSize = this.ranges[i + oldIndex], newSize = this.ranges[i + newIndex];
				f(oldStart, oldStart + oldSize, newStart, newStart + newSize);
				diff += newSize - oldSize;
			}
		}
		/**
		Create an inverted version of this map. The result can be used to
		map positions in the post-step document to the pre-step document.
		*/
		invert() {
			return new StepMap(this.ranges, !this.inverted);
		}
		/**
		@internal
		*/
		toString() {
			return (this.inverted ? "-" : "") + JSON.stringify(this.ranges);
		}
		/**
		Create a map that moves all positions by offset `n` (which may be
		negative). This can be useful when applying steps meant for a
		sub-document to a larger document, or vice-versa.
		*/
		static offset(n) {
			return n == 0 ? StepMap.empty : new StepMap(n < 0 ? [
				0,
				-n,
				0
			] : [
				0,
				0,
				n
			]);
		}
	};
	/**
	A StepMap that contains no changed ranges.
	*/
	StepMap.empty = new StepMap([]);
	/**
	A mapping represents a pipeline of zero or more [step
	maps](https://prosemirror.net/docs/ref/#transform.StepMap). It has special provisions for losslessly
	handling mapping positions through a series of steps in which some
	steps are inverted versions of earlier steps. (This comes up when
	‘[rebasing](https://prosemirror.net/docs/guide/#transform.rebasing)’ steps for
	collaboration or history management.)
	*/
	var Mapping = class Mapping {
		/**
		Create a new mapping with the given position maps.
		*/
		constructor(maps, mirror, from = 0, to = maps ? maps.length : 0) {
			this.mirror = mirror;
			this.from = from;
			this.to = to;
			this._maps = maps || [];
			this.ownData = !(maps || mirror);
		}
		/**
		The step maps in this mapping.
		*/
		get maps() {
			return this._maps;
		}
		/**
		Create a mapping that maps only through a part of this one.
		*/
		slice(from = 0, to = this.maps.length) {
			return new Mapping(this._maps, this.mirror, from, to);
		}
		/**
		Add a step map to the end of this mapping. If `mirrors` is
		given, it should be the index of the step map that is the mirror
		image of this one.
		*/
		appendMap(map, mirrors) {
			if (!this.ownData) {
				this._maps = this._maps.slice();
				this.mirror = this.mirror && this.mirror.slice();
				this.ownData = true;
			}
			this.to = this._maps.push(map);
			if (mirrors != null) this.setMirror(this._maps.length - 1, mirrors);
		}
		/**
		Add all the step maps in a given mapping to this one (preserving
		mirroring information).
		*/
		appendMapping(mapping) {
			for (let i = 0, startSize = this._maps.length; i < mapping._maps.length; i++) {
				let mirr = mapping.getMirror(i);
				this.appendMap(mapping._maps[i], mirr != null && mirr < i ? startSize + mirr : void 0);
			}
		}
		/**
		Finds the offset of the step map that mirrors the map at the
		given offset, in this mapping (as per the second argument to
		`appendMap`).
		*/
		getMirror(n) {
			if (this.mirror) {
				for (let i = 0; i < this.mirror.length; i++) if (this.mirror[i] == n) return this.mirror[i + (i % 2 ? -1 : 1)];
			}
		}
		/**
		@internal
		*/
		setMirror(n, m) {
			if (!this.mirror) this.mirror = [];
			this.mirror.push(n, m);
		}
		/**
		Append the inverse of the given mapping to this one.
		*/
		appendMappingInverted(mapping) {
			for (let i = mapping.maps.length - 1, totalSize = this._maps.length + mapping._maps.length; i >= 0; i--) {
				let mirr = mapping.getMirror(i);
				this.appendMap(mapping._maps[i].invert(), mirr != null && mirr > i ? totalSize - mirr - 1 : void 0);
			}
		}
		/**
		Create an inverted version of this mapping.
		*/
		invert() {
			let inverse = new Mapping();
			inverse.appendMappingInverted(this);
			return inverse;
		}
		/**
		Map a position through this mapping.
		*/
		map(pos, assoc = 1) {
			if (this.mirror) return this._map(pos, assoc, true);
			for (let i = this.from; i < this.to; i++) pos = this._maps[i].map(pos, assoc);
			return pos;
		}
		/**
		Map a position through this mapping, returning a mapping
		result.
		*/
		mapResult(pos, assoc = 1) {
			return this._map(pos, assoc, false);
		}
		/**
		@internal
		*/
		_map(pos, assoc, simple) {
			let delInfo = 0;
			for (let i = this.from; i < this.to; i++) {
				let result = this._maps[i].mapResult(pos, assoc);
				if (result.recover != null) {
					let corr = this.getMirror(i);
					if (corr != null && corr > i && corr < this.to) {
						i = corr;
						pos = this._maps[corr].recover(result.recover);
						continue;
					}
				}
				delInfo |= result.delInfo;
				pos = result.pos;
			}
			return simple ? pos : new MapResult(pos, delInfo, null);
		}
	};
	var stepsByID = Object.create(null);
	/**
	A step object represents an atomic change. It generally applies
	only to the document it was created for, since the positions
	stored in it will only make sense for that document.
	
	New steps are defined by creating classes that extend `Step`,
	overriding the `apply`, `invert`, `map`, `getMap` and `fromJSON`
	methods, and registering your class with a unique
	JSON-serialization identifier using
	[`Step.jsonID`](https://prosemirror.net/docs/ref/#transform.Step^jsonID).
	*/
	var Step = class {
		/**
		Get the step map that represents the changes made by this step,
		and which can be used to transform between positions in the old
		and the new document.
		*/
		getMap() {
			return StepMap.empty;
		}
		/**
		Try to merge this step with another one, to be applied directly
		after it. Returns the merged step when possible, null if the
		steps can't be merged.
		*/
		merge(other) {
			return null;
		}
		/**
		Deserialize a step from its JSON representation. Will call
		through to the step class' own implementation of this method.
		*/
		static fromJSON(schema, json) {
			if (!json || !json.stepType) throw new RangeError("Invalid input for Step.fromJSON");
			let type = stepsByID[json.stepType];
			if (!type) throw new RangeError(`No step type ${json.stepType} defined`);
			return type.fromJSON(schema, json);
		}
		/**
		To be able to serialize steps to JSON, each step needs a string
		ID to attach to its JSON representation. Use this method to
		register an ID for your step classes. Try to pick something
		that's unlikely to clash with steps from other modules.
		*/
		static jsonID(id, stepClass) {
			if (id in stepsByID) throw new RangeError("Duplicate use of step JSON ID " + id);
			stepsByID[id] = stepClass;
			stepClass.prototype.jsonID = id;
			return stepClass;
		}
	};
	/**
	The result of [applying](https://prosemirror.net/docs/ref/#transform.Step.apply) a step. Contains either a
	new document or a failure value.
	*/
	var StepResult = class StepResult {
		/**
		@internal
		*/
		constructor(doc, failed) {
			this.doc = doc;
			this.failed = failed;
		}
		/**
		Create a successful step result.
		*/
		static ok(doc) {
			return new StepResult(doc, null);
		}
		/**
		Create a failed step result.
		*/
		static fail(message) {
			return new StepResult(null, message);
		}
		/**
		Call [`Node.replace`](https://prosemirror.net/docs/ref/#model.Node.replace) with the given
		arguments. Create a successful result if it succeeds, and a
		failed one if it throws a `ReplaceError`.
		*/
		static fromReplace(doc, from, to, slice) {
			try {
				return StepResult.ok(doc.replace(from, to, slice));
			} catch (e) {
				if (e instanceof ReplaceError) return StepResult.fail(e.message);
				throw e;
			}
		}
	};
	function mapFragment(fragment, f, parent) {
		let mapped = [];
		for (let i = 0; i < fragment.childCount; i++) {
			let child = fragment.child(i);
			if (child.content.size) child = child.copy(mapFragment(child.content, f, child));
			if (child.isInline) child = f(child, parent, i);
			mapped.push(child);
		}
		return Fragment.fromArray(mapped);
	}
	/**
	Add a mark to all inline content between two positions.
	*/
	var AddMarkStep = class AddMarkStep extends Step {
		/**
		Create a mark step.
		*/
		constructor(from, to, mark) {
			super();
			this.from = from;
			this.to = to;
			this.mark = mark;
		}
		apply(doc) {
			let oldSlice = doc.slice(this.from, this.to), $from = doc.resolve(this.from);
			let parent = $from.node($from.sharedDepth(this.to));
			let slice = new Slice(mapFragment(oldSlice.content, (node, parent) => {
				if (!node.isAtom || !parent.type.allowsMarkType(this.mark.type)) return node;
				return node.mark(this.mark.addToSet(node.marks));
			}, parent), oldSlice.openStart, oldSlice.openEnd);
			return StepResult.fromReplace(doc, this.from, this.to, slice);
		}
		invert() {
			return new RemoveMarkStep(this.from, this.to, this.mark);
		}
		map(mapping) {
			let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
			if (from.deleted && to.deleted || from.pos >= to.pos) return null;
			return new AddMarkStep(from.pos, to.pos, this.mark);
		}
		merge(other) {
			if (other instanceof AddMarkStep && other.mark.eq(this.mark) && this.from <= other.to && this.to >= other.from) return new AddMarkStep(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
			return null;
		}
		toJSON() {
			return {
				stepType: "addMark",
				mark: this.mark.toJSON(),
				from: this.from,
				to: this.to
			};
		}
		/**
		@internal
		*/
		static fromJSON(schema, json) {
			if (typeof json.from != "number" || typeof json.to != "number") throw new RangeError("Invalid input for AddMarkStep.fromJSON");
			return new AddMarkStep(json.from, json.to, schema.markFromJSON(json.mark));
		}
	};
	Step.jsonID("addMark", AddMarkStep);
	/**
	Remove a mark from all inline content between two positions.
	*/
	var RemoveMarkStep = class RemoveMarkStep extends Step {
		/**
		Create a mark-removing step.
		*/
		constructor(from, to, mark) {
			super();
			this.from = from;
			this.to = to;
			this.mark = mark;
		}
		apply(doc) {
			let oldSlice = doc.slice(this.from, this.to);
			let slice = new Slice(mapFragment(oldSlice.content, (node) => {
				return node.mark(this.mark.removeFromSet(node.marks));
			}, doc), oldSlice.openStart, oldSlice.openEnd);
			return StepResult.fromReplace(doc, this.from, this.to, slice);
		}
		invert() {
			return new AddMarkStep(this.from, this.to, this.mark);
		}
		map(mapping) {
			let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
			if (from.deleted && to.deleted || from.pos >= to.pos) return null;
			return new RemoveMarkStep(from.pos, to.pos, this.mark);
		}
		merge(other) {
			if (other instanceof RemoveMarkStep && other.mark.eq(this.mark) && this.from <= other.to && this.to >= other.from) return new RemoveMarkStep(Math.min(this.from, other.from), Math.max(this.to, other.to), this.mark);
			return null;
		}
		toJSON() {
			return {
				stepType: "removeMark",
				mark: this.mark.toJSON(),
				from: this.from,
				to: this.to
			};
		}
		/**
		@internal
		*/
		static fromJSON(schema, json) {
			if (typeof json.from != "number" || typeof json.to != "number") throw new RangeError("Invalid input for RemoveMarkStep.fromJSON");
			return new RemoveMarkStep(json.from, json.to, schema.markFromJSON(json.mark));
		}
	};
	Step.jsonID("removeMark", RemoveMarkStep);
	/**
	Add a mark to a specific node.
	*/
	var AddNodeMarkStep = class AddNodeMarkStep extends Step {
		/**
		Create a node mark step.
		*/
		constructor(pos, mark) {
			super();
			this.pos = pos;
			this.mark = mark;
		}
		apply(doc) {
			let node = doc.nodeAt(this.pos);
			if (!node) return StepResult.fail("No node at mark step's position");
			let updated = node.type.create(node.attrs, null, this.mark.addToSet(node.marks));
			return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
		}
		invert(doc) {
			let node = doc.nodeAt(this.pos);
			if (node) {
				let newSet = this.mark.addToSet(node.marks);
				if (newSet.length == node.marks.length) {
					for (let i = 0; i < node.marks.length; i++) if (!node.marks[i].isInSet(newSet)) return new AddNodeMarkStep(this.pos, node.marks[i]);
					return new AddNodeMarkStep(this.pos, this.mark);
				}
			}
			return new RemoveNodeMarkStep(this.pos, this.mark);
		}
		map(mapping) {
			let pos = mapping.mapResult(this.pos, 1);
			return pos.deletedAfter ? null : new AddNodeMarkStep(pos.pos, this.mark);
		}
		toJSON() {
			return {
				stepType: "addNodeMark",
				pos: this.pos,
				mark: this.mark.toJSON()
			};
		}
		/**
		@internal
		*/
		static fromJSON(schema, json) {
			if (typeof json.pos != "number") throw new RangeError("Invalid input for AddNodeMarkStep.fromJSON");
			return new AddNodeMarkStep(json.pos, schema.markFromJSON(json.mark));
		}
	};
	Step.jsonID("addNodeMark", AddNodeMarkStep);
	/**
	Remove a mark from a specific node.
	*/
	var RemoveNodeMarkStep = class RemoveNodeMarkStep extends Step {
		/**
		Create a mark-removing step.
		*/
		constructor(pos, mark) {
			super();
			this.pos = pos;
			this.mark = mark;
		}
		apply(doc) {
			let node = doc.nodeAt(this.pos);
			if (!node) return StepResult.fail("No node at mark step's position");
			let updated = node.type.create(node.attrs, null, this.mark.removeFromSet(node.marks));
			return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
		}
		invert(doc) {
			let node = doc.nodeAt(this.pos);
			if (!node || !this.mark.isInSet(node.marks)) return this;
			return new AddNodeMarkStep(this.pos, this.mark);
		}
		map(mapping) {
			let pos = mapping.mapResult(this.pos, 1);
			return pos.deletedAfter ? null : new RemoveNodeMarkStep(pos.pos, this.mark);
		}
		toJSON() {
			return {
				stepType: "removeNodeMark",
				pos: this.pos,
				mark: this.mark.toJSON()
			};
		}
		/**
		@internal
		*/
		static fromJSON(schema, json) {
			if (typeof json.pos != "number") throw new RangeError("Invalid input for RemoveNodeMarkStep.fromJSON");
			return new RemoveNodeMarkStep(json.pos, schema.markFromJSON(json.mark));
		}
	};
	Step.jsonID("removeNodeMark", RemoveNodeMarkStep);
	/**
	Replace a part of the document with a slice of new content.
	*/
	var ReplaceStep = class ReplaceStep extends Step {
		/**
		The given `slice` should fit the 'gap' between `from` and
		`to`—the depths must line up, and the surrounding nodes must be
		able to be joined with the open sides of the slice. When
		`structure` is true, the step will fail if the content between
		from and to is not just a sequence of closing and then opening
		tokens (this is to guard against rebased replace steps
		overwriting something they weren't supposed to).
		*/
		constructor(from, to, slice, structure = false) {
			super();
			this.from = from;
			this.to = to;
			this.slice = slice;
			this.structure = structure;
		}
		apply(doc) {
			if (this.structure && contentBetween(doc, this.from, this.to)) return StepResult.fail("Structure replace would overwrite content");
			return StepResult.fromReplace(doc, this.from, this.to, this.slice);
		}
		getMap() {
			return new StepMap([
				this.from,
				this.to - this.from,
				this.slice.size
			]);
		}
		invert(doc) {
			return new ReplaceStep(this.from, this.from + this.slice.size, doc.slice(this.from, this.to));
		}
		map(mapping) {
			let to = mapping.mapResult(this.to, -1);
			let from = this.from == this.to && ReplaceStep.MAP_BIAS < 0 ? to : mapping.mapResult(this.from, 1);
			if (from.deletedAcross && to.deletedAcross) return null;
			return new ReplaceStep(from.pos, Math.max(from.pos, to.pos), this.slice, this.structure);
		}
		merge(other) {
			if (!(other instanceof ReplaceStep) || other.structure || this.structure) return null;
			if (this.from + this.slice.size == other.from && !this.slice.openEnd && !other.slice.openStart) {
				let slice = this.slice.size + other.slice.size == 0 ? Slice.empty : new Slice(this.slice.content.append(other.slice.content), this.slice.openStart, other.slice.openEnd);
				return new ReplaceStep(this.from, this.to + (other.to - other.from), slice, this.structure);
			} else if (other.to == this.from && !this.slice.openStart && !other.slice.openEnd) {
				let slice = this.slice.size + other.slice.size == 0 ? Slice.empty : new Slice(other.slice.content.append(this.slice.content), other.slice.openStart, this.slice.openEnd);
				return new ReplaceStep(other.from, this.to, slice, this.structure);
			} else return null;
		}
		toJSON() {
			let json = {
				stepType: "replace",
				from: this.from,
				to: this.to
			};
			if (this.slice.size) json.slice = this.slice.toJSON();
			if (this.structure) json.structure = true;
			return json;
		}
		/**
		@internal
		*/
		static fromJSON(schema, json) {
			if (typeof json.from != "number" || typeof json.to != "number") throw new RangeError("Invalid input for ReplaceStep.fromJSON");
			return new ReplaceStep(json.from, json.to, Slice.fromJSON(schema, json.slice), !!json.structure);
		}
	};
	/**
	By default, for backwards compatibility, an inserting step
	mapped over an insertion at that same position fill move after
	the inserted content. In a collaborative editing situation, that
	can make redone insertions appear in unexpected places. You can
	set this to -1 to make such mapping keep the step before the
	insertion instead.
	*/
	ReplaceStep.MAP_BIAS = 1;
	Step.jsonID("replace", ReplaceStep);
	/**
	Replace a part of the document with a slice of content, but
	preserve a range of the replaced content by moving it into the
	slice.
	*/
	var ReplaceAroundStep = class ReplaceAroundStep extends Step {
		/**
		Create a replace-around step with the given range and gap.
		`insert` should be the point in the slice into which the content
		of the gap should be moved. `structure` has the same meaning as
		it has in the [`ReplaceStep`](https://prosemirror.net/docs/ref/#transform.ReplaceStep) class.
		*/
		constructor(from, to, gapFrom, gapTo, slice, insert, structure = false) {
			super();
			this.from = from;
			this.to = to;
			this.gapFrom = gapFrom;
			this.gapTo = gapTo;
			this.slice = slice;
			this.insert = insert;
			this.structure = structure;
		}
		apply(doc) {
			if (this.structure && (contentBetween(doc, this.from, this.gapFrom) || contentBetween(doc, this.gapTo, this.to))) return StepResult.fail("Structure gap-replace would overwrite content");
			let gap = doc.slice(this.gapFrom, this.gapTo);
			if (gap.openStart || gap.openEnd) return StepResult.fail("Gap is not a flat range");
			let inserted = this.slice.insertAt(this.insert, gap.content);
			if (!inserted) return StepResult.fail("Content does not fit in gap");
			return StepResult.fromReplace(doc, this.from, this.to, inserted);
		}
		getMap() {
			return new StepMap([
				this.from,
				this.gapFrom - this.from,
				this.insert,
				this.gapTo,
				this.to - this.gapTo,
				this.slice.size - this.insert
			]);
		}
		invert(doc) {
			let gap = this.gapTo - this.gapFrom;
			return new ReplaceAroundStep(this.from, this.from + this.slice.size + gap, this.from + this.insert, this.from + this.insert + gap, doc.slice(this.from, this.to).removeBetween(this.gapFrom - this.from, this.gapTo - this.from), this.gapFrom - this.from, this.structure);
		}
		map(mapping) {
			let from = mapping.mapResult(this.from, 1), to = mapping.mapResult(this.to, -1);
			let gapFrom = this.from == this.gapFrom ? from.pos : mapping.map(this.gapFrom, -1);
			let gapTo = this.to == this.gapTo ? to.pos : mapping.map(this.gapTo, 1);
			if (from.deletedAcross && to.deletedAcross || gapFrom < from.pos || gapTo > to.pos) return null;
			return new ReplaceAroundStep(from.pos, to.pos, gapFrom, gapTo, this.slice, this.insert, this.structure);
		}
		toJSON() {
			let json = {
				stepType: "replaceAround",
				from: this.from,
				to: this.to,
				gapFrom: this.gapFrom,
				gapTo: this.gapTo,
				insert: this.insert
			};
			if (this.slice.size) json.slice = this.slice.toJSON();
			if (this.structure) json.structure = true;
			return json;
		}
		/**
		@internal
		*/
		static fromJSON(schema, json) {
			if (typeof json.from != "number" || typeof json.to != "number" || typeof json.gapFrom != "number" || typeof json.gapTo != "number" || typeof json.insert != "number") throw new RangeError("Invalid input for ReplaceAroundStep.fromJSON");
			return new ReplaceAroundStep(json.from, json.to, json.gapFrom, json.gapTo, Slice.fromJSON(schema, json.slice), json.insert, !!json.structure);
		}
	};
	Step.jsonID("replaceAround", ReplaceAroundStep);
	function contentBetween(doc, from, to) {
		let $from = doc.resolve(from), dist = to - from, depth = $from.depth;
		while (dist > 0 && depth > 0 && $from.indexAfter(depth) == $from.node(depth).childCount) {
			depth--;
			dist--;
		}
		if (dist > 0) {
			let next = $from.node(depth).maybeChild($from.indexAfter(depth));
			while (dist > 0) {
				if (!next || next.isLeaf) return true;
				next = next.firstChild;
				dist--;
			}
		}
		return false;
	}
	function addMark(tr, from, to, mark) {
		let removed = [], added = [];
		let removing, adding;
		tr.doc.nodesBetween(from, to, (node, pos, parent) => {
			if (!node.isInline) return;
			let marks = node.marks;
			if (!mark.isInSet(marks) && parent.type.allowsMarkType(mark.type)) {
				let start = Math.max(pos, from), end = Math.min(pos + node.nodeSize, to);
				let newSet = mark.addToSet(marks);
				for (let i = 0; i < marks.length; i++) if (!marks[i].isInSet(newSet)) if (removing && removing.to == start && removing.mark.eq(marks[i])) removing.to = end;
				else removed.push(removing = new RemoveMarkStep(start, end, marks[i]));
				if (adding && adding.to == start) adding.to = end;
				else added.push(adding = new AddMarkStep(start, end, mark));
			}
		});
		removed.forEach((s) => tr.step(s));
		added.forEach((s) => tr.step(s));
	}
	function removeMark(tr, from, to, mark) {
		let matched = [], step = 0;
		tr.doc.nodesBetween(from, to, (node, pos) => {
			if (!node.isInline) return;
			step++;
			let toRemove = null;
			if (mark instanceof MarkType) {
				let set = node.marks, found;
				while (found = mark.isInSet(set)) {
					(toRemove || (toRemove = [])).push(found);
					set = found.removeFromSet(set);
				}
			} else if (mark) {
				if (mark.isInSet(node.marks)) toRemove = [mark];
			} else toRemove = node.marks;
			if (toRemove && toRemove.length) {
				let end = Math.min(pos + node.nodeSize, to);
				for (let i = 0; i < toRemove.length; i++) {
					let style = toRemove[i], found;
					for (let j = 0; j < matched.length; j++) {
						let m = matched[j];
						if (m.step == step - 1 && style.eq(matched[j].style)) found = m;
					}
					if (found) {
						found.to = end;
						found.step = step;
					} else matched.push({
						style,
						from: Math.max(pos, from),
						to: end,
						step
					});
				}
			}
		});
		matched.forEach((m) => tr.step(new RemoveMarkStep(m.from, m.to, m.style)));
	}
	function clearIncompatible(tr, pos, parentType, match = parentType.contentMatch, clearNewlines = true) {
		let node = tr.doc.nodeAt(pos);
		let replSteps = [], cur = pos + 1;
		for (let i = 0; i < node.childCount; i++) {
			let child = node.child(i), end = cur + child.nodeSize;
			let allowed = match.matchType(child.type);
			if (!allowed) replSteps.push(new ReplaceStep(cur, end, Slice.empty));
			else {
				match = allowed;
				for (let j = 0; j < child.marks.length; j++) if (!parentType.allowsMarkType(child.marks[j].type)) tr.step(new RemoveMarkStep(cur, end, child.marks[j]));
				if (clearNewlines && child.isText && parentType.whitespace != "pre") {
					let m, newline = /\r?\n|\r/g, slice;
					while (m = newline.exec(child.text)) {
						if (!slice) slice = new Slice(Fragment.from(parentType.schema.text(" ", parentType.allowedMarks(child.marks))), 0, 0);
						replSteps.push(new ReplaceStep(cur + m.index, cur + m.index + m[0].length, slice));
					}
				}
			}
			cur = end;
		}
		if (!match.validEnd) {
			let fill = match.fillBefore(Fragment.empty, true);
			tr.replace(cur, cur, new Slice(fill, 0, 0));
		}
		for (let i = replSteps.length - 1; i >= 0; i--) tr.step(replSteps[i]);
	}
	function canCut(node, start, end) {
		return (start == 0 || node.canReplace(start, node.childCount)) && (end == node.childCount || node.canReplace(0, end));
	}
	/**
	Try to find a target depth to which the content in the given range
	can be lifted. Will not go across
	[isolating](https://prosemirror.net/docs/ref/#model.NodeSpec.isolating) parent nodes.
	*/
	function liftTarget(range) {
		let content = range.parent.content.cutByIndex(range.startIndex, range.endIndex);
		for (let depth = range.depth, contentBefore = 0, contentAfter = 0;; --depth) {
			let node = range.$from.node(depth);
			let index = range.$from.index(depth) + contentBefore, endIndex = range.$to.indexAfter(depth) - contentAfter;
			if (depth < range.depth && node.canReplace(index, endIndex, content)) return depth;
			if (depth == 0 || node.type.spec.isolating || !canCut(node, index, endIndex)) break;
			if (index) contentBefore = 1;
			if (endIndex < node.childCount) contentAfter = 1;
		}
		return null;
	}
	function lift$1(tr, range, target) {
		let { $from, $to, depth } = range;
		let gapStart = $from.before(depth + 1), gapEnd = $to.after(depth + 1);
		let start = gapStart, end = gapEnd;
		let before = Fragment.empty, openStart = 0;
		for (let d = depth, splitting = false; d > target; d--) if (splitting || $from.index(d) > 0) {
			splitting = true;
			before = Fragment.from($from.node(d).copy(before));
			openStart++;
		} else start--;
		let after = Fragment.empty, openEnd = 0;
		for (let d = depth, splitting = false; d > target; d--) if (splitting || $to.after(d + 1) < $to.end(d)) {
			splitting = true;
			after = Fragment.from($to.node(d).copy(after));
			openEnd++;
		} else end++;
		tr.step(new ReplaceAroundStep(start, end, gapStart, gapEnd, new Slice(before.append(after), openStart, openEnd), before.size - openStart, true));
	}
	/**
	Try to find a valid way to wrap the content in the given range in a
	node of the given type. May introduce extra nodes around and inside
	the wrapper node, if necessary. Returns null if no valid wrapping
	could be found. When `innerRange` is given, that range's content is
	used as the content to fit into the wrapping, instead of the
	content of `range`.
	*/
	function findWrapping(range, nodeType, attrs = null, innerRange = range) {
		let around = findWrappingOutside(range, nodeType);
		let inner = around && findWrappingInside(innerRange, nodeType);
		if (!inner) return null;
		return around.map(withAttrs).concat({
			type: nodeType,
			attrs
		}).concat(inner.map(withAttrs));
	}
	function withAttrs(type) {
		return {
			type,
			attrs: null
		};
	}
	function findWrappingOutside(range, type) {
		let { parent, startIndex, endIndex } = range;
		let around = parent.contentMatchAt(startIndex).findWrapping(type);
		if (!around) return null;
		let outer = around.length ? around[0] : type;
		return parent.canReplaceWith(startIndex, endIndex, outer) ? around : null;
	}
	function findWrappingInside(range, type) {
		let { parent, startIndex, endIndex } = range;
		let inner = parent.child(startIndex);
		let inside = type.contentMatch.findWrapping(inner.type);
		if (!inside) return null;
		let innerMatch = (inside.length ? inside[inside.length - 1] : type).contentMatch;
		for (let i = startIndex; innerMatch && i < endIndex; i++) innerMatch = innerMatch.matchType(parent.child(i).type);
		if (!innerMatch || !innerMatch.validEnd) return null;
		return inside;
	}
	function wrap$1(tr, range, wrappers) {
		let content = Fragment.empty;
		for (let i = wrappers.length - 1; i >= 0; i--) {
			if (content.size) {
				let match = wrappers[i].type.contentMatch.matchFragment(content);
				if (!match || !match.validEnd) throw new RangeError("Wrapper type given to Transform.wrap does not form valid content of its parent wrapper");
			}
			content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content));
		}
		let start = range.start, end = range.end;
		tr.step(new ReplaceAroundStep(start, end, start, end, new Slice(content, 0, 0), wrappers.length, true));
	}
	function setBlockType$1(tr, from, to, type, attrs) {
		if (!type.isTextblock) throw new RangeError("Type given to setBlockType should be a textblock");
		let mapFrom = tr.steps.length;
		tr.doc.nodesBetween(from, to, (node, pos) => {
			let attrsHere = typeof attrs == "function" ? attrs(node) : attrs;
			if (node.isTextblock && !node.hasMarkup(type, attrsHere) && canChangeType(tr.doc, tr.mapping.slice(mapFrom).map(pos), type)) {
				let convertNewlines = null;
				if (type.schema.linebreakReplacement) {
					let pre = type.whitespace == "pre", supportLinebreak = !!type.contentMatch.matchType(type.schema.linebreakReplacement);
					if (pre && !supportLinebreak) convertNewlines = false;
					else if (!pre && supportLinebreak) convertNewlines = true;
				}
				if (convertNewlines === false) replaceLinebreaks(tr, node, pos, mapFrom);
				clearIncompatible(tr, tr.mapping.slice(mapFrom).map(pos, 1), type, void 0, convertNewlines === null);
				let mapping = tr.mapping.slice(mapFrom);
				let startM = mapping.map(pos, 1), endM = mapping.map(pos + node.nodeSize, 1);
				tr.step(new ReplaceAroundStep(startM, endM, startM + 1, endM - 1, new Slice(Fragment.from(type.create(attrsHere, null, node.marks)), 0, 0), 1, true));
				if (convertNewlines === true) replaceNewlines(tr, node, pos, mapFrom);
				return false;
			}
		});
	}
	function replaceNewlines(tr, node, pos, mapFrom) {
		node.forEach((child, offset) => {
			if (child.isText) {
				let m, newline = /\r?\n|\r/g;
				while (m = newline.exec(child.text)) {
					let start = tr.mapping.slice(mapFrom).map(pos + 1 + offset + m.index);
					tr.replaceWith(start, start + 1, node.type.schema.linebreakReplacement.create());
				}
			}
		});
	}
	function replaceLinebreaks(tr, node, pos, mapFrom) {
		node.forEach((child, offset) => {
			if (child.type == child.type.schema.linebreakReplacement) {
				let start = tr.mapping.slice(mapFrom).map(pos + 1 + offset);
				tr.replaceWith(start, start + 1, node.type.schema.text("\n"));
			}
		});
	}
	function canChangeType(doc, pos, type) {
		let $pos = doc.resolve(pos), index = $pos.index();
		return $pos.parent.canReplaceWith(index, index + 1, type);
	}
	/**
	Change the type, attributes, and/or marks of the node at `pos`.
	When `type` isn't given, the existing node type is preserved,
	*/
	function setNodeMarkup(tr, pos, type, attrs, marks) {
		let node = tr.doc.nodeAt(pos);
		if (!node) throw new RangeError("No node at given position");
		if (!type) type = node.type;
		let newNode = type.create(attrs, null, marks || node.marks);
		if (node.isLeaf) return tr.replaceWith(pos, pos + node.nodeSize, newNode);
		if (!type.validContent(node.content)) throw new RangeError("Invalid content for node type " + type.name);
		tr.step(new ReplaceAroundStep(pos, pos + node.nodeSize, pos + 1, pos + node.nodeSize - 1, new Slice(Fragment.from(newNode), 0, 0), 1, true));
	}
	/**
	Check whether splitting at the given position is allowed.
	*/
	function canSplit(doc, pos, depth = 1, typesAfter) {
		let $pos = doc.resolve(pos), base = $pos.depth - depth;
		let innerType = typesAfter && typesAfter[typesAfter.length - 1] || $pos.parent;
		if (base < 0 || $pos.parent.type.spec.isolating || !$pos.parent.canReplace($pos.index(), $pos.parent.childCount) || !innerType.type.validContent($pos.parent.content.cutByIndex($pos.index(), $pos.parent.childCount))) return false;
		for (let d = $pos.depth - 1, i = depth - 2; d > base; d--, i--) {
			let node = $pos.node(d), index = $pos.index(d);
			if (node.type.spec.isolating) return false;
			let rest = node.content.cutByIndex(index, node.childCount);
			let overrideChild = typesAfter && typesAfter[i + 1];
			if (overrideChild) rest = rest.replaceChild(0, overrideChild.type.create(overrideChild.attrs));
			let after = typesAfter && typesAfter[i] || node;
			if (!node.canReplace(index + 1, node.childCount) || !after.type.validContent(rest)) return false;
		}
		let index = $pos.indexAfter(base);
		let baseType = typesAfter && typesAfter[0];
		return $pos.node(base).canReplaceWith(index, index, baseType ? baseType.type : $pos.node(base + 1).type);
	}
	function split(tr, pos, depth = 1, typesAfter) {
		let $pos = tr.doc.resolve(pos), before = Fragment.empty, after = Fragment.empty;
		for (let d = $pos.depth, e = $pos.depth - depth, i = depth - 1; d > e; d--, i--) {
			before = Fragment.from($pos.node(d).copy(before));
			let typeAfter = typesAfter && typesAfter[i];
			after = Fragment.from(typeAfter ? typeAfter.type.create(typeAfter.attrs, after) : $pos.node(d).copy(after));
		}
		tr.step(new ReplaceStep(pos, pos, new Slice(before.append(after), depth, depth), true));
	}
	/**
	Test whether the blocks before and after a given position can be
	joined.
	*/
	function canJoin(doc, pos) {
		let $pos = doc.resolve(pos), index = $pos.index();
		return joinable($pos.nodeBefore, $pos.nodeAfter) && $pos.parent.canReplace(index, index + 1);
	}
	function canAppendWithSubstitutedLinebreaks(a, b) {
		if (!b.content.size) a.type.compatibleContent(b.type);
		let match = a.contentMatchAt(a.childCount);
		let { linebreakReplacement } = a.type.schema;
		for (let i = 0; i < b.childCount; i++) {
			let child = b.child(i);
			let type = child.type == linebreakReplacement ? a.type.schema.nodes.text : child.type;
			match = match.matchType(type);
			if (!match) return false;
			if (!a.type.allowsMarks(child.marks)) return false;
		}
		return match.validEnd;
	}
	function joinable(a, b) {
		return !!(a && b && !a.isLeaf && canAppendWithSubstitutedLinebreaks(a, b));
	}
	function join$2(tr, pos, depth) {
		let convertNewlines = null;
		let { linebreakReplacement } = tr.doc.type.schema;
		let $before = tr.doc.resolve(pos - depth), beforeType = $before.node().type;
		if (linebreakReplacement && beforeType.inlineContent) {
			let pre = beforeType.whitespace == "pre";
			let supportLinebreak = !!beforeType.contentMatch.matchType(linebreakReplacement);
			if (pre && !supportLinebreak) convertNewlines = false;
			else if (!pre && supportLinebreak) convertNewlines = true;
		}
		let mapFrom = tr.steps.length;
		if (convertNewlines === false) {
			let $after = tr.doc.resolve(pos + depth);
			replaceLinebreaks(tr, $after.node(), $after.before(), mapFrom);
		}
		if (beforeType.inlineContent) clearIncompatible(tr, pos + depth - 1, beforeType, $before.node().contentMatchAt($before.index()), convertNewlines == null);
		let mapping = tr.mapping.slice(mapFrom), start = mapping.map(pos - depth);
		tr.step(new ReplaceStep(start, mapping.map(pos + depth, -1), Slice.empty, true));
		if (convertNewlines === true) {
			let $full = tr.doc.resolve(start);
			replaceNewlines(tr, $full.node(), $full.before(), tr.steps.length);
		}
		return tr;
	}
	/**
	Try to find a point where a node of the given type can be inserted
	near `pos`, by searching up the node hierarchy when `pos` itself
	isn't a valid place but is at the start or end of a node. Return
	null if no position was found.
	*/
	function insertPoint(doc, pos, nodeType) {
		let $pos = doc.resolve(pos);
		if ($pos.parent.canReplaceWith($pos.index(), $pos.index(), nodeType)) return pos;
		if ($pos.parentOffset == 0) for (let d = $pos.depth - 1; d >= 0; d--) {
			let index = $pos.index(d);
			if ($pos.node(d).canReplaceWith(index, index, nodeType)) return $pos.before(d + 1);
			if (index > 0) return null;
		}
		if ($pos.parentOffset == $pos.parent.content.size) for (let d = $pos.depth - 1; d >= 0; d--) {
			let index = $pos.indexAfter(d);
			if ($pos.node(d).canReplaceWith(index, index, nodeType)) return $pos.after(d + 1);
			if (index < $pos.node(d).childCount) return null;
		}
		return null;
	}
	/**
	Finds a position at or around the given position where the given
	slice can be inserted. Will look at parent nodes' nearest boundary
	and try there, even if the original position wasn't directly at the
	start or end of that node. Returns null when no position was found.
	*/
	function dropPoint(doc, pos, slice) {
		let $pos = doc.resolve(pos);
		if (!slice.content.size) return pos;
		let content = slice.content;
		for (let i = 0; i < slice.openStart; i++) content = content.firstChild.content;
		for (let pass = 1; pass <= (slice.openStart == 0 && slice.size ? 2 : 1); pass++) for (let d = $pos.depth; d >= 0; d--) {
			let bias = d == $pos.depth ? 0 : $pos.pos <= ($pos.start(d + 1) + $pos.end(d + 1)) / 2 ? -1 : 1;
			let insertPos = $pos.index(d) + (bias > 0 ? 1 : 0);
			let parent = $pos.node(d), fits = false;
			if (pass == 1) fits = parent.canReplace(insertPos, insertPos, content);
			else {
				let wrapping = parent.contentMatchAt(insertPos).findWrapping(content.firstChild.type);
				fits = wrapping && parent.canReplaceWith(insertPos, insertPos, wrapping[0]);
			}
			if (fits) return bias == 0 ? $pos.pos : bias < 0 ? $pos.before(d + 1) : $pos.after(d + 1);
		}
		return null;
	}
	/**
	‘Fit’ a slice into a given position in the document, producing a
	[step](https://prosemirror.net/docs/ref/#transform.Step) that inserts it. Will return null if
	there's no meaningful way to insert the slice here, or inserting it
	would be a no-op (an empty slice over an empty range).
	*/
	function replaceStep(doc, from, to = from, slice = Slice.empty) {
		if (from == to && !slice.size) return null;
		let $from = doc.resolve(from), $to = doc.resolve(to);
		if (fitsTrivially($from, $to, slice)) return new ReplaceStep(from, to, slice);
		return new Fitter($from, $to, slice).fit();
	}
	function fitsTrivially($from, $to, slice) {
		return !slice.openStart && !slice.openEnd && $from.start() == $to.start() && $from.parent.canReplace($from.index(), $to.index(), slice.content);
	}
	var Fitter = class {
		constructor($from, $to, unplaced) {
			this.$from = $from;
			this.$to = $to;
			this.unplaced = unplaced;
			this.frontier = [];
			this.placed = Fragment.empty;
			for (let i = 0; i <= $from.depth; i++) {
				let node = $from.node(i);
				this.frontier.push({
					type: node.type,
					match: node.contentMatchAt($from.indexAfter(i))
				});
			}
			for (let i = $from.depth; i > 0; i--) this.placed = Fragment.from($from.node(i).copy(this.placed));
		}
		get depth() {
			return this.frontier.length - 1;
		}
		fit() {
			while (this.unplaced.size) {
				let fit = this.findFittable();
				if (fit) this.placeNodes(fit);
				else this.openMore() || this.dropNode();
			}
			let moveInline = this.mustMoveInline(), placedSize = this.placed.size - this.depth - this.$from.depth;
			let $from = this.$from, $to = this.close(moveInline < 0 ? this.$to : $from.doc.resolve(moveInline));
			if (!$to) return null;
			let content = this.placed, openStart = $from.depth, openEnd = $to.depth;
			while (openStart && openEnd && content.childCount == 1) {
				content = content.firstChild.content;
				openStart--;
				openEnd--;
			}
			let slice = new Slice(content, openStart, openEnd);
			if (moveInline > -1) return new ReplaceAroundStep($from.pos, moveInline, this.$to.pos, this.$to.end(), slice, placedSize);
			if (slice.size || $from.pos != this.$to.pos) return new ReplaceStep($from.pos, $to.pos, slice);
			return null;
		}
		findFittable() {
			let startDepth = this.unplaced.openStart;
			for (let cur = this.unplaced.content, d = 0, openEnd = this.unplaced.openEnd; d < startDepth; d++) {
				let node = cur.firstChild;
				if (cur.childCount > 1) openEnd = 0;
				if (node.type.spec.isolating && openEnd <= d) {
					startDepth = d;
					break;
				}
				cur = node.content;
			}
			for (let pass = 1; pass <= 2; pass++) for (let sliceDepth = pass == 1 ? startDepth : this.unplaced.openStart; sliceDepth >= 0; sliceDepth--) {
				let fragment, parent = null;
				if (sliceDepth) {
					parent = contentAt(this.unplaced.content, sliceDepth - 1).firstChild;
					fragment = parent.content;
				} else fragment = this.unplaced.content;
				let first = fragment.firstChild;
				for (let frontierDepth = this.depth; frontierDepth >= 0; frontierDepth--) {
					let { type, match } = this.frontier[frontierDepth], wrap, inject = null;
					if (pass == 1 && (first ? match.matchType(first.type) || (inject = match.fillBefore(Fragment.from(first), false)) : parent && type.compatibleContent(parent.type))) return {
						sliceDepth,
						frontierDepth,
						parent,
						inject
					};
					else if (pass == 2 && first && (wrap = match.findWrapping(first.type))) return {
						sliceDepth,
						frontierDepth,
						parent,
						wrap
					};
					if (parent && match.matchType(parent.type)) break;
				}
			}
		}
		openMore() {
			let { content, openStart, openEnd } = this.unplaced;
			let inner = contentAt(content, openStart);
			if (!inner.childCount || inner.firstChild.isLeaf) return false;
			this.unplaced = new Slice(content, openStart + 1, Math.max(openEnd, inner.size + openStart >= content.size - openEnd ? openStart + 1 : 0));
			return true;
		}
		dropNode() {
			let { content, openStart, openEnd } = this.unplaced;
			let inner = contentAt(content, openStart);
			if (inner.childCount <= 1 && openStart > 0) {
				let openAtEnd = content.size - openStart <= openStart + inner.size;
				this.unplaced = new Slice(dropFromFragment(content, openStart - 1, 1), openStart - 1, openAtEnd ? openStart - 1 : openEnd);
			} else this.unplaced = new Slice(dropFromFragment(content, openStart, 1), openStart, openEnd);
		}
		placeNodes({ sliceDepth, frontierDepth, parent, inject, wrap }) {
			while (this.depth > frontierDepth) this.closeFrontierNode();
			if (wrap) for (let i = 0; i < wrap.length; i++) this.openFrontierNode(wrap[i]);
			let slice = this.unplaced, fragment = parent ? parent.content : slice.content;
			let openStart = slice.openStart - sliceDepth;
			let taken = 0, add = [];
			let { match, type } = this.frontier[frontierDepth];
			if (inject) {
				for (let i = 0; i < inject.childCount; i++) add.push(inject.child(i));
				match = match.matchFragment(inject);
			}
			let openEndCount = fragment.size + sliceDepth - (slice.content.size - slice.openEnd);
			while (taken < fragment.childCount) {
				let next = fragment.child(taken), matches = match.matchType(next.type);
				if (!matches) break;
				taken++;
				if (taken > 1 || openStart == 0 || next.content.size) {
					match = matches;
					add.push(closeNodeStart(next.mark(type.allowedMarks(next.marks)), taken == 1 ? openStart : 0, taken == fragment.childCount ? openEndCount : -1));
				}
			}
			let toEnd = taken == fragment.childCount;
			if (!toEnd) openEndCount = -1;
			this.placed = addToFragment(this.placed, frontierDepth, Fragment.from(add));
			this.frontier[frontierDepth].match = match;
			if (toEnd && openEndCount < 0 && parent && parent.type == this.frontier[this.depth].type && this.frontier.length > 1) this.closeFrontierNode();
			for (let i = 0, cur = fragment; i < openEndCount; i++) {
				let node = cur.lastChild;
				this.frontier.push({
					type: node.type,
					match: node.contentMatchAt(node.childCount)
				});
				cur = node.content;
			}
			this.unplaced = !toEnd ? new Slice(dropFromFragment(slice.content, sliceDepth, taken), slice.openStart, slice.openEnd) : sliceDepth == 0 ? Slice.empty : new Slice(dropFromFragment(slice.content, sliceDepth - 1, 1), sliceDepth - 1, openEndCount < 0 ? slice.openEnd : sliceDepth - 1);
		}
		mustMoveInline() {
			if (!this.$to.parent.isTextblock) return -1;
			let top = this.frontier[this.depth], level;
			if (!top.type.isTextblock || !contentAfterFits(this.$to, this.$to.depth, top.type, top.match, false) || this.$to.depth == this.depth && (level = this.findCloseLevel(this.$to)) && level.depth == this.depth) return -1;
			let { depth } = this.$to, after = this.$to.after(depth);
			while (depth > 1 && after == this.$to.end(--depth)) ++after;
			return after;
		}
		findCloseLevel($to) {
			scan: for (let i = Math.min(this.depth, $to.depth); i >= 0; i--) {
				let { match, type } = this.frontier[i];
				let dropInner = i < $to.depth && $to.end(i + 1) == $to.pos + ($to.depth - (i + 1));
				let fit = contentAfterFits($to, i, type, match, dropInner);
				if (!fit) continue;
				for (let d = i - 1; d >= 0; d--) {
					let { match, type } = this.frontier[d];
					let matches = contentAfterFits($to, d, type, match, true);
					if (!matches || matches.childCount) continue scan;
				}
				return {
					depth: i,
					fit,
					move: dropInner ? $to.doc.resolve($to.after(i + 1)) : $to
				};
			}
		}
		close($to) {
			let close = this.findCloseLevel($to);
			if (!close) return null;
			while (this.depth > close.depth) this.closeFrontierNode();
			if (close.fit.childCount) this.placed = addToFragment(this.placed, close.depth, close.fit);
			$to = close.move;
			for (let d = close.depth + 1; d <= $to.depth; d++) {
				let node = $to.node(d), add = node.type.contentMatch.fillBefore(node.content, true, $to.index(d));
				this.openFrontierNode(node.type, node.attrs, add);
			}
			return $to;
		}
		openFrontierNode(type, attrs = null, content) {
			let top = this.frontier[this.depth];
			top.match = top.match.matchType(type);
			this.placed = addToFragment(this.placed, this.depth, Fragment.from(type.create(attrs, content)));
			this.frontier.push({
				type,
				match: type.contentMatch
			});
		}
		closeFrontierNode() {
			let add = this.frontier.pop().match.fillBefore(Fragment.empty, true);
			if (add.childCount) this.placed = addToFragment(this.placed, this.frontier.length, add);
		}
	};
	function dropFromFragment(fragment, depth, count) {
		if (depth == 0) return fragment.cutByIndex(count, fragment.childCount);
		return fragment.replaceChild(0, fragment.firstChild.copy(dropFromFragment(fragment.firstChild.content, depth - 1, count)));
	}
	function addToFragment(fragment, depth, content) {
		if (depth == 0) return fragment.append(content);
		return fragment.replaceChild(fragment.childCount - 1, fragment.lastChild.copy(addToFragment(fragment.lastChild.content, depth - 1, content)));
	}
	function contentAt(fragment, depth) {
		for (let i = 0; i < depth; i++) fragment = fragment.firstChild.content;
		return fragment;
	}
	function closeNodeStart(node, openStart, openEnd) {
		if (openStart <= 0) return node;
		let frag = node.content;
		if (openStart > 1) frag = frag.replaceChild(0, closeNodeStart(frag.firstChild, openStart - 1, frag.childCount == 1 ? openEnd - 1 : 0));
		if (openStart > 0) {
			frag = node.type.contentMatch.fillBefore(frag).append(frag);
			if (openEnd <= 0) frag = frag.append(node.type.contentMatch.matchFragment(frag).fillBefore(Fragment.empty, true));
		}
		return node.copy(frag);
	}
	function contentAfterFits($to, depth, type, match, open) {
		let node = $to.node(depth), index = open ? $to.indexAfter(depth) : $to.index(depth);
		if (index == node.childCount && !type.compatibleContent(node.type)) return null;
		let fit = match.fillBefore(node.content, true, index);
		return fit && !invalidMarks(type, node.content, index) ? fit : null;
	}
	function invalidMarks(type, fragment, start) {
		for (let i = start; i < fragment.childCount; i++) if (!type.allowsMarks(fragment.child(i).marks)) return true;
		return false;
	}
	function definesContent(type) {
		return type.spec.defining || type.spec.definingForContent;
	}
	function replaceRange(tr, from, to, slice) {
		if (!slice.size) return tr.deleteRange(from, to);
		let $from = tr.doc.resolve(from), $to = tr.doc.resolve(to);
		if (fitsTrivially($from, $to, slice)) return tr.step(new ReplaceStep(from, to, slice));
		let targetDepths = coveredDepths($from, $to);
		if (targetDepths[targetDepths.length - 1] == 0) targetDepths.pop();
		let preferredTarget = -($from.depth + 1);
		targetDepths.unshift(preferredTarget);
		for (let d = $from.depth, pos = $from.pos - 1; d > 0; d--, pos--) {
			let spec = $from.node(d).type.spec;
			if (spec.defining || spec.definingAsContext || spec.isolating) break;
			if (targetDepths.indexOf(d) > -1) preferredTarget = d;
			else if ($from.before(d) == pos) targetDepths.splice(1, 0, -d);
		}
		let preferredTargetIndex = targetDepths.indexOf(preferredTarget);
		let leftNodes = [], preferredDepth = slice.openStart;
		for (let content = slice.content, i = 0;; i++) {
			let node = content.firstChild;
			leftNodes.push(node);
			if (i == slice.openStart) break;
			content = node.content;
		}
		for (let d = preferredDepth - 1; d >= 0; d--) {
			let leftNode = leftNodes[d], def = definesContent(leftNode.type);
			if (def && !leftNode.sameMarkup($from.node(Math.abs(preferredTarget) - 1))) preferredDepth = d;
			else if (def || !leftNode.type.isTextblock) break;
		}
		for (let j = slice.openStart; j >= 0; j--) {
			let openDepth = (j + preferredDepth + 1) % (slice.openStart + 1);
			let insert = leftNodes[openDepth];
			if (!insert) continue;
			for (let i = 0; i < targetDepths.length; i++) {
				let targetDepth = targetDepths[(i + preferredTargetIndex) % targetDepths.length], expand = true;
				if (targetDepth < 0) {
					expand = false;
					targetDepth = -targetDepth;
				}
				let parent = $from.node(targetDepth - 1), index = $from.index(targetDepth - 1);
				if (parent.canReplaceWith(index, index, insert.type, insert.marks)) return tr.replace($from.before(targetDepth), expand ? $to.after(targetDepth) : to, new Slice(closeFragment(slice.content, 0, slice.openStart, openDepth), openDepth, slice.openEnd));
			}
		}
		let startSteps = tr.steps.length;
		for (let i = targetDepths.length - 1; i >= 0; i--) {
			tr.replace(from, to, slice);
			if (tr.steps.length > startSteps) break;
			let depth = targetDepths[i];
			if (depth < 0) continue;
			from = $from.before(depth);
			to = $to.after(depth);
		}
	}
	function closeFragment(fragment, depth, oldOpen, newOpen, parent) {
		if (depth < oldOpen) {
			let first = fragment.firstChild;
			fragment = fragment.replaceChild(0, first.copy(closeFragment(first.content, depth + 1, oldOpen, newOpen, first)));
		}
		if (depth > newOpen) {
			let match = parent.contentMatchAt(0);
			let start = match.fillBefore(fragment).append(fragment);
			fragment = start.append(match.matchFragment(start).fillBefore(Fragment.empty, true));
		}
		return fragment;
	}
	function replaceRangeWith(tr, from, to, node) {
		if (!node.isInline && from == to && tr.doc.resolve(from).parent.content.size) {
			let point = insertPoint(tr.doc, from, node.type);
			if (point != null) from = to = point;
		}
		tr.replaceRange(from, to, new Slice(Fragment.from(node), 0, 0));
	}
	function deleteRange(tr, from, to) {
		let $from = tr.doc.resolve(from), $to = tr.doc.resolve(to);
		if ($from.parent.isTextblock && $to.parent.isTextblock && $from.start() != $to.start() && $from.parentOffset == 0 && $to.parentOffset == 0) {
			let shared = $from.sharedDepth(to), isolated = false;
			for (let d = $from.depth; d > shared; d--) if ($from.node(d).type.spec.isolating) isolated = true;
			for (let d = $to.depth; d > shared; d--) if ($to.node(d).type.spec.isolating) isolated = true;
			if (!isolated) {
				for (let d = $from.depth; d > 0 && from == $from.start(d); d--) from = $from.before(d);
				for (let d = $to.depth; d > 0 && to == $to.start(d); d--) to = $to.before(d);
				$from = tr.doc.resolve(from);
				$to = tr.doc.resolve(to);
			}
		}
		let covered = coveredDepths($from, $to);
		for (let i = 0; i < covered.length; i++) {
			let depth = covered[i], last = i == covered.length - 1;
			if (last && depth == 0 || $from.node(depth).type.contentMatch.validEnd) return tr.delete($from.start(depth), $to.end(depth));
			if (depth > 0 && (last || $from.node(depth - 1).canReplace($from.index(depth - 1), $to.indexAfter(depth - 1)))) return tr.delete($from.before(depth), $to.after(depth));
		}
		for (let d = 1; d <= $from.depth && d <= $to.depth; d++) if (from - $from.start(d) == $from.depth - d && to > $from.end(d) && $to.end(d) - to != $to.depth - d && $from.start(d - 1) == $to.start(d - 1) && $from.node(d - 1).canReplace($from.index(d - 1), $to.index(d - 1))) return tr.delete($from.before(d), to);
		tr.delete(from, to);
	}
	function coveredDepths($from, $to) {
		let result = [], minDepth = Math.min($from.depth, $to.depth);
		for (let d = minDepth; d >= 0; d--) {
			let start = $from.start(d);
			if (start < $from.pos - ($from.depth - d) || $to.end(d) > $to.pos + ($to.depth - d) || $from.node(d).type.spec.isolating || $to.node(d).type.spec.isolating) break;
			if (start == $to.start(d) || d == $from.depth && d == $to.depth && $from.parent.inlineContent && $to.parent.inlineContent && d && $to.start(d - 1) == start - 1) result.push(d);
		}
		return result;
	}
	/**
	Update an attribute in a specific node.
	*/
	var AttrStep = class AttrStep extends Step {
		/**
		Construct an attribute step.
		*/
		constructor(pos, attr, value) {
			super();
			this.pos = pos;
			this.attr = attr;
			this.value = value;
		}
		apply(doc) {
			let node = doc.nodeAt(this.pos);
			if (!node) return StepResult.fail("No node at attribute step's position");
			let attrs = Object.create(null);
			for (let name in node.attrs) attrs[name] = node.attrs[name];
			attrs[this.attr] = this.value;
			let updated = node.type.create(attrs, null, node.marks);
			return StepResult.fromReplace(doc, this.pos, this.pos + 1, new Slice(Fragment.from(updated), 0, node.isLeaf ? 0 : 1));
		}
		getMap() {
			return StepMap.empty;
		}
		invert(doc) {
			return new AttrStep(this.pos, this.attr, doc.nodeAt(this.pos).attrs[this.attr]);
		}
		map(mapping) {
			let pos = mapping.mapResult(this.pos, 1);
			return pos.deletedAfter ? null : new AttrStep(pos.pos, this.attr, this.value);
		}
		toJSON() {
			return {
				stepType: "attr",
				pos: this.pos,
				attr: this.attr,
				value: this.value
			};
		}
		static fromJSON(schema, json) {
			if (typeof json.pos != "number" || typeof json.attr != "string") throw new RangeError("Invalid input for AttrStep.fromJSON");
			return new AttrStep(json.pos, json.attr, json.value);
		}
	};
	Step.jsonID("attr", AttrStep);
	/**
	Update an attribute in the doc node.
	*/
	var DocAttrStep = class DocAttrStep extends Step {
		/**
		Construct an attribute step.
		*/
		constructor(attr, value) {
			super();
			this.attr = attr;
			this.value = value;
		}
		apply(doc) {
			let attrs = Object.create(null);
			for (let name in doc.attrs) attrs[name] = doc.attrs[name];
			attrs[this.attr] = this.value;
			let updated = doc.type.create(attrs, doc.content, doc.marks);
			return StepResult.ok(updated);
		}
		getMap() {
			return StepMap.empty;
		}
		invert(doc) {
			return new DocAttrStep(this.attr, doc.attrs[this.attr]);
		}
		map(mapping) {
			return this;
		}
		toJSON() {
			return {
				stepType: "docAttr",
				attr: this.attr,
				value: this.value
			};
		}
		static fromJSON(schema, json) {
			if (typeof json.attr != "string") throw new RangeError("Invalid input for DocAttrStep.fromJSON");
			return new DocAttrStep(json.attr, json.value);
		}
	};
	Step.jsonID("docAttr", DocAttrStep);
	/**
	@internal
	*/
	var TransformError = class extends Error {};
	TransformError = function TransformError(message) {
		let err = Error.call(this, message);
		err.__proto__ = TransformError.prototype;
		return err;
	};
	TransformError.prototype = Object.create(Error.prototype);
	TransformError.prototype.constructor = TransformError;
	TransformError.prototype.name = "TransformError";
	/**
	Abstraction to build up and track an array of
	[steps](https://prosemirror.net/docs/ref/#transform.Step) representing a document transformation.
	
	Most transforming methods return the `Transform` object itself, so
	that they can be chained.
	*/
	var Transform = class {
		/**
		Create a transform that starts with the given document.
		*/
		constructor(doc) {
			this.doc = doc;
			/**
			The steps in this transform.
			*/
			this.steps = [];
			/**
			The documents before each of the steps.
			*/
			this.docs = [];
			/**
			A mapping with the maps for each of the steps in this transform.
			*/
			this.mapping = new Mapping();
		}
		/**
		The starting document.
		*/
		get before() {
			return this.docs.length ? this.docs[0] : this.doc;
		}
		/**
		Apply a new step in this transform, saving the result. Throws an
		error when the step fails.
		*/
		step(step) {
			let result = this.maybeStep(step);
			if (result.failed) throw new TransformError(result.failed);
			return this;
		}
		/**
		Try to apply a step in this transformation, ignoring it if it
		fails. Returns the step result.
		*/
		maybeStep(step) {
			let result = step.apply(this.doc);
			if (!result.failed) this.addStep(step, result.doc);
			return result;
		}
		/**
		True when the document has been changed (when there are any
		steps).
		*/
		get docChanged() {
			return this.steps.length > 0;
		}
		/**
		Return a single range, in post-transform document positions,
		that covers all content changed by this transform. Returns null
		if no replacements are made. Note that this will ignore changes
		that add/remove marks without replacing the underlying content.
		*/
		changedRange() {
			let from = 1e9, to = -1e9;
			for (let i = 0; i < this.mapping.maps.length; i++) {
				let map = this.mapping.maps[i];
				if (i) {
					from = map.map(from, 1);
					to = map.map(to, -1);
				}
				map.forEach((_f, _t, fromB, toB) => {
					from = Math.min(from, fromB);
					to = Math.max(to, toB);
				});
			}
			return from == 1e9 ? null : {
				from,
				to
			};
		}
		/**
		@internal
		*/
		addStep(step, doc) {
			this.docs.push(this.doc);
			this.steps.push(step);
			this.mapping.appendMap(step.getMap());
			this.doc = doc;
		}
		/**
		Replace the part of the document between `from` and `to` with the
		given `slice`.
		*/
		replace(from, to = from, slice = Slice.empty) {
			let step = replaceStep(this.doc, from, to, slice);
			if (step) this.step(step);
			return this;
		}
		/**
		Replace the given range with the given content, which may be a
		fragment, node, or array of nodes.
		*/
		replaceWith(from, to, content) {
			return this.replace(from, to, new Slice(Fragment.from(content), 0, 0));
		}
		/**
		Delete the content between the given positions.
		*/
		delete(from, to) {
			return this.replace(from, to, Slice.empty);
		}
		/**
		Insert the given content at the given position.
		*/
		insert(pos, content) {
			return this.replaceWith(pos, pos, content);
		}
		/**
		Replace a range of the document with a given slice, using
		`from`, `to`, and the slice's
		[`openStart`](https://prosemirror.net/docs/ref/#model.Slice.openStart) property as hints, rather
		than fixed start and end points. This method may grow the
		replaced area or close open nodes in the slice in order to get a
		fit that is more in line with WYSIWYG expectations, by dropping
		fully covered parent nodes of the replaced region when they are
		marked [non-defining as
		context](https://prosemirror.net/docs/ref/#model.NodeSpec.definingAsContext), or including an
		open parent node from the slice that _is_ marked as [defining
		its content](https://prosemirror.net/docs/ref/#model.NodeSpec.definingForContent).
		
		This is the method, for example, to handle paste. The similar
		[`replace`](https://prosemirror.net/docs/ref/#transform.Transform.replace) method is a more
		primitive tool which will _not_ move the start and end of its given
		range, and is useful in situations where you need more precise
		control over what happens.
		*/
		replaceRange(from, to, slice) {
			replaceRange(this, from, to, slice);
			return this;
		}
		/**
		Replace the given range with a node, but use `from` and `to` as
		hints, rather than precise positions. When from and to are the same
		and are at the start or end of a parent node in which the given
		node doesn't fit, this method may _move_ them out towards a parent
		that does allow the given node to be placed. When the given range
		completely covers a parent node, this method may completely replace
		that parent node.
		*/
		replaceRangeWith(from, to, node) {
			replaceRangeWith(this, from, to, node);
			return this;
		}
		/**
		Delete the given range, expanding it to cover fully covered
		parent nodes until a valid replace is found.
		*/
		deleteRange(from, to) {
			deleteRange(this, from, to);
			return this;
		}
		/**
		Split the content in the given range off from its parent, if there
		is sibling content before or after it, and move it up the tree to
		the depth specified by `target`. You'll probably want to use
		[`liftTarget`](https://prosemirror.net/docs/ref/#transform.liftTarget) to compute `target`, to make
		sure the lift is valid.
		*/
		lift(range, target) {
			lift$1(this, range, target);
			return this;
		}
		/**
		Join the blocks around the given position. If depth is 2, their
		last and first siblings are also joined, and so on.
		*/
		join(pos, depth = 1) {
			join$2(this, pos, depth);
			return this;
		}
		/**
		Wrap the given [range](https://prosemirror.net/docs/ref/#model.NodeRange) in the given set of wrappers.
		The wrappers are assumed to be valid in this position, and should
		probably be computed with [`findWrapping`](https://prosemirror.net/docs/ref/#transform.findWrapping).
		*/
		wrap(range, wrappers) {
			wrap$1(this, range, wrappers);
			return this;
		}
		/**
		Set the type of all textblocks (partly) between `from` and `to` to
		the given node type with the given attributes.
		*/
		setBlockType(from, to = from, type, attrs = null) {
			setBlockType$1(this, from, to, type, attrs);
			return this;
		}
		/**
		Change the type, attributes, and/or marks of the node at `pos`.
		When `type` isn't given, the existing node type is preserved,
		*/
		setNodeMarkup(pos, type, attrs = null, marks) {
			setNodeMarkup(this, pos, type, attrs, marks);
			return this;
		}
		/**
		Set a single attribute on a given node to a new value.
		The `pos` addresses the document content. Use `setDocAttribute`
		to set attributes on the document itself.
		*/
		setNodeAttribute(pos, attr, value) {
			this.step(new AttrStep(pos, attr, value));
			return this;
		}
		/**
		Set a single attribute on the document to a new value.
		*/
		setDocAttribute(attr, value) {
			this.step(new DocAttrStep(attr, value));
			return this;
		}
		/**
		Add a mark to the node at position `pos`.
		*/
		addNodeMark(pos, mark) {
			this.step(new AddNodeMarkStep(pos, mark));
			return this;
		}
		/**
		Remove a mark (or all marks of the given type) from the node at
		position `pos`.
		*/
		removeNodeMark(pos, mark) {
			let node = this.doc.nodeAt(pos);
			if (!node) throw new RangeError("No node at position " + pos);
			if (mark instanceof Mark) {
				if (mark.isInSet(node.marks)) this.step(new RemoveNodeMarkStep(pos, mark));
			} else {
				let set = node.marks, found, steps = [];
				while (found = mark.isInSet(set)) {
					steps.push(new RemoveNodeMarkStep(pos, found));
					set = found.removeFromSet(set);
				}
				for (let i = steps.length - 1; i >= 0; i--) this.step(steps[i]);
			}
			return this;
		}
		/**
		Split the node at the given position, and optionally, if `depth` is
		greater than one, any number of nodes above that. By default, the
		parts split off will inherit the node type of the original node.
		This can be changed by passing an array of types and attributes to
		use after the split (with the outermost nodes coming first).
		*/
		split(pos, depth = 1, typesAfter) {
			split(this, pos, depth, typesAfter);
			return this;
		}
		/**
		Add the given mark to the inline content between `from` and `to`.
		*/
		addMark(from, to, mark) {
			addMark(this, from, to, mark);
			return this;
		}
		/**
		Remove marks from inline nodes between `from` and `to`. When
		`mark` is a single mark, remove precisely that mark. When it is
		a mark type, remove all marks of that type. When it is null,
		remove all marks of any type.
		*/
		removeMark(from, to, mark) {
			removeMark(this, from, to, mark);
			return this;
		}
		/**
		Removes all marks and nodes from the content of the node at
		`pos` that don't match the given new parent node type. Accepts
		an optional starting [content match](https://prosemirror.net/docs/ref/#model.ContentMatch) as
		third argument.
		*/
		clearIncompatible(pos, parentType, match) {
			clearIncompatible(this, pos, parentType, match);
			return this;
		}
	};
	//#endregion
	//#region node_modules/prosemirror-state/dist/index.js
	var classesById = Object.create(null);
	/**
	Superclass for editor selections. Every selection type should
	extend this. Should not be instantiated directly.
	*/
	var Selection = class {
		/**
		Initialize a selection with the head and anchor and ranges. If no
		ranges are given, constructs a single range across `$anchor` and
		`$head`.
		*/
		constructor($anchor, $head, ranges) {
			this.$anchor = $anchor;
			this.$head = $head;
			this.ranges = ranges || [new SelectionRange($anchor.min($head), $anchor.max($head))];
		}
		/**
		The selection's anchor, as an unresolved position.
		*/
		get anchor() {
			return this.$anchor.pos;
		}
		/**
		The selection's head.
		*/
		get head() {
			return this.$head.pos;
		}
		/**
		The lower bound of the selection's main range.
		*/
		get from() {
			return this.$from.pos;
		}
		/**
		The upper bound of the selection's main range.
		*/
		get to() {
			return this.$to.pos;
		}
		/**
		The resolved lower  bound of the selection's main range.
		*/
		get $from() {
			return this.ranges[0].$from;
		}
		/**
		The resolved upper bound of the selection's main range.
		*/
		get $to() {
			return this.ranges[0].$to;
		}
		/**
		Indicates whether the selection contains any content.
		*/
		get empty() {
			let ranges = this.ranges;
			for (let i = 0; i < ranges.length; i++) if (ranges[i].$from.pos != ranges[i].$to.pos) return false;
			return true;
		}
		/**
		Get the content of this selection as a slice.
		*/
		content() {
			return this.$from.doc.slice(this.from, this.to, true);
		}
		/**
		Replace the selection with a slice or, if no slice is given,
		delete the selection. Will append to the given transaction.
		*/
		replace(tr, content = Slice.empty) {
			let lastNode = content.content.lastChild, lastParent = null;
			for (let i = 0; i < content.openEnd; i++) {
				lastParent = lastNode;
				lastNode = lastNode.lastChild;
			}
			let mapFrom = tr.steps.length, ranges = this.ranges;
			for (let i = 0; i < ranges.length; i++) {
				let { $from, $to } = ranges[i], mapping = tr.mapping.slice(mapFrom);
				tr.replaceRange(mapping.map($from.pos), mapping.map($to.pos), i ? Slice.empty : content);
				if (i == 0) selectionToInsertionEnd(tr, mapFrom, (lastNode ? lastNode.isInline : lastParent && lastParent.isTextblock) ? -1 : 1);
			}
		}
		/**
		Replace the selection with the given node, appending the changes
		to the given transaction.
		*/
		replaceWith(tr, node) {
			let mapFrom = tr.steps.length, ranges = this.ranges;
			for (let i = 0; i < ranges.length; i++) {
				let { $from, $to } = ranges[i], mapping = tr.mapping.slice(mapFrom);
				let from = mapping.map($from.pos), to = mapping.map($to.pos);
				if (i) tr.deleteRange(from, to);
				else {
					tr.replaceRangeWith(from, to, node);
					selectionToInsertionEnd(tr, mapFrom, node.isInline ? -1 : 1);
				}
			}
		}
		/**
		Find a valid cursor or leaf node selection starting at the given
		position and searching back if `dir` is negative, and forward if
		positive. When `textOnly` is true, only consider cursor
		selections. Will return null when no valid selection position is
		found.
		*/
		static findFrom($pos, dir, textOnly = false) {
			let inner = $pos.parent.inlineContent ? new TextSelection($pos) : findSelectionIn($pos.node(0), $pos.parent, $pos.pos, $pos.index(), dir, textOnly);
			if (inner) return inner;
			for (let depth = $pos.depth - 1; depth >= 0; depth--) {
				let found = dir < 0 ? findSelectionIn($pos.node(0), $pos.node(depth), $pos.before(depth + 1), $pos.index(depth), dir, textOnly) : findSelectionIn($pos.node(0), $pos.node(depth), $pos.after(depth + 1), $pos.index(depth) + 1, dir, textOnly);
				if (found) return found;
			}
			return null;
		}
		/**
		Find a valid cursor or leaf node selection near the given
		position. Searches forward first by default, but if `bias` is
		negative, it will search backwards first.
		*/
		static near($pos, bias = 1) {
			return this.findFrom($pos, bias) || this.findFrom($pos, -bias) || new AllSelection($pos.node(0));
		}
		/**
		Find the cursor or leaf node selection closest to the start of
		the given document. Will return an
		[`AllSelection`](https://prosemirror.net/docs/ref/#state.AllSelection) if no valid position
		exists.
		*/
		static atStart(doc) {
			return findSelectionIn(doc, doc, 0, 0, 1) || new AllSelection(doc);
		}
		/**
		Find the cursor or leaf node selection closest to the end of the
		given document.
		*/
		static atEnd(doc) {
			return findSelectionIn(doc, doc, doc.content.size, doc.childCount, -1) || new AllSelection(doc);
		}
		/**
		Deserialize the JSON representation of a selection. Must be
		implemented for custom classes (as a static class method).
		*/
		static fromJSON(doc, json) {
			if (!json || !json.type) throw new RangeError("Invalid input for Selection.fromJSON");
			let cls = classesById[json.type];
			if (!cls) throw new RangeError(`No selection type ${json.type} defined`);
			return cls.fromJSON(doc, json);
		}
		/**
		To be able to deserialize selections from JSON, custom selection
		classes must register themselves with an ID string, so that they
		can be disambiguated. Try to pick something that's unlikely to
		clash with classes from other modules.
		*/
		static jsonID(id, selectionClass) {
			if (id in classesById) throw new RangeError("Duplicate use of selection JSON ID " + id);
			classesById[id] = selectionClass;
			selectionClass.prototype.jsonID = id;
			return selectionClass;
		}
		/**
		Get a [bookmark](https://prosemirror.net/docs/ref/#state.SelectionBookmark) for this selection,
		which is a value that can be mapped without having access to a
		current document, and later resolved to a real selection for a
		given document again. (This is used mostly by the history to
		track and restore old selections.) The default implementation of
		this method just converts the selection to a text selection and
		returns the bookmark for that.
		*/
		getBookmark() {
			return TextSelection.between(this.$anchor, this.$head).getBookmark();
		}
	};
	Selection.prototype.visible = true;
	/**
	Represents a selected range in a document.
	*/
	var SelectionRange = class {
		/**
		Create a range.
		*/
		constructor($from, $to) {
			this.$from = $from;
			this.$to = $to;
		}
	};
	var warnedAboutTextSelection = false;
	function checkTextSelection($pos) {
		if (!warnedAboutTextSelection && !$pos.parent.inlineContent) {
			warnedAboutTextSelection = true;
			console["warn"]("TextSelection endpoint not pointing into a node with inline content (" + $pos.parent.type.name + ")");
		}
	}
	/**
	A text selection represents a classical editor selection, with a
	head (the moving side) and anchor (immobile side), both of which
	point into textblock nodes. It can be empty (a regular cursor
	position).
	*/
	var TextSelection = class TextSelection extends Selection {
		/**
		Construct a text selection between the given points.
		*/
		constructor($anchor, $head = $anchor) {
			checkTextSelection($anchor);
			checkTextSelection($head);
			super($anchor, $head);
		}
		/**
		Returns a resolved position if this is a cursor selection (an
		empty text selection), and null otherwise.
		*/
		get $cursor() {
			return this.$anchor.pos == this.$head.pos ? this.$head : null;
		}
		map(doc, mapping) {
			let $head = doc.resolve(mapping.map(this.head));
			if (!$head.parent.inlineContent) return Selection.near($head);
			let $anchor = doc.resolve(mapping.map(this.anchor));
			return new TextSelection($anchor.parent.inlineContent ? $anchor : $head, $head);
		}
		replace(tr, content = Slice.empty) {
			super.replace(tr, content);
			if (content == Slice.empty) {
				let marks = this.$from.marksAcross(this.$to);
				if (marks) tr.ensureMarks(marks);
			}
		}
		eq(other) {
			return other instanceof TextSelection && other.anchor == this.anchor && other.head == this.head;
		}
		getBookmark() {
			return new TextBookmark(this.anchor, this.head);
		}
		toJSON() {
			return {
				type: "text",
				anchor: this.anchor,
				head: this.head
			};
		}
		/**
		@internal
		*/
		static fromJSON(doc, json) {
			if (typeof json.anchor != "number" || typeof json.head != "number") throw new RangeError("Invalid input for TextSelection.fromJSON");
			return new TextSelection(doc.resolve(json.anchor), doc.resolve(json.head));
		}
		/**
		Create a text selection from non-resolved positions.
		*/
		static create(doc, anchor, head = anchor) {
			let $anchor = doc.resolve(anchor);
			return new this($anchor, head == anchor ? $anchor : doc.resolve(head));
		}
		/**
		Return a text selection that spans the given positions or, if
		they aren't text positions, find a text selection near them.
		`bias` determines whether the method searches forward (default)
		or backwards (negative number) first. Will fall back to calling
		[`Selection.near`](https://prosemirror.net/docs/ref/#state.Selection^near) when the document
		doesn't contain a valid text position.
		*/
		static between($anchor, $head, bias) {
			let dPos = $anchor.pos - $head.pos;
			if (!bias || dPos) bias = dPos >= 0 ? 1 : -1;
			if (!$head.parent.inlineContent) {
				let found = Selection.findFrom($head, bias, true) || Selection.findFrom($head, -bias, true);
				if (found) $head = found.$head;
				else return Selection.near($head, bias);
			}
			if (!$anchor.parent.inlineContent) if (dPos == 0) $anchor = $head;
			else {
				$anchor = (Selection.findFrom($anchor, -bias, true) || Selection.findFrom($anchor, bias, true)).$anchor;
				if ($anchor.pos < $head.pos != dPos < 0) $anchor = $head;
			}
			return new TextSelection($anchor, $head);
		}
	};
	Selection.jsonID("text", TextSelection);
	var TextBookmark = class TextBookmark {
		constructor(anchor, head) {
			this.anchor = anchor;
			this.head = head;
		}
		map(mapping) {
			return new TextBookmark(mapping.map(this.anchor), mapping.map(this.head));
		}
		resolve(doc) {
			return TextSelection.between(doc.resolve(this.anchor), doc.resolve(this.head));
		}
	};
	/**
	A node selection is a selection that points at a single node. All
	nodes marked [selectable](https://prosemirror.net/docs/ref/#model.NodeSpec.selectable) can be the
	target of a node selection. In such a selection, `from` and `to`
	point directly before and after the selected node, `anchor` equals
	`from`, and `head` equals `to`..
	*/
	var NodeSelection = class NodeSelection extends Selection {
		/**
		Create a node selection. Does not verify the validity of its
		argument.
		*/
		constructor($pos) {
			let node = $pos.nodeAfter;
			let $end = $pos.node(0).resolve($pos.pos + node.nodeSize);
			super($pos, $end);
			this.node = node;
		}
		map(doc, mapping) {
			let { deleted, pos } = mapping.mapResult(this.anchor);
			let $pos = doc.resolve(pos);
			if (deleted) return Selection.near($pos);
			return new NodeSelection($pos);
		}
		content() {
			return new Slice(Fragment.from(this.node), 0, 0);
		}
		eq(other) {
			return other instanceof NodeSelection && other.anchor == this.anchor;
		}
		toJSON() {
			return {
				type: "node",
				anchor: this.anchor
			};
		}
		getBookmark() {
			return new NodeBookmark(this.anchor);
		}
		/**
		@internal
		*/
		static fromJSON(doc, json) {
			if (typeof json.anchor != "number") throw new RangeError("Invalid input for NodeSelection.fromJSON");
			return new NodeSelection(doc.resolve(json.anchor));
		}
		/**
		Create a node selection from non-resolved positions.
		*/
		static create(doc, from) {
			return new NodeSelection(doc.resolve(from));
		}
		/**
		Determines whether the given node may be selected as a node
		selection.
		*/
		static isSelectable(node) {
			return !node.isText && node.type.spec.selectable !== false;
		}
	};
	NodeSelection.prototype.visible = false;
	Selection.jsonID("node", NodeSelection);
	var NodeBookmark = class NodeBookmark {
		constructor(anchor) {
			this.anchor = anchor;
		}
		map(mapping) {
			let { deleted, pos } = mapping.mapResult(this.anchor);
			return deleted ? new TextBookmark(pos, pos) : new NodeBookmark(pos);
		}
		resolve(doc) {
			let $pos = doc.resolve(this.anchor), node = $pos.nodeAfter;
			if (node && NodeSelection.isSelectable(node)) return new NodeSelection($pos);
			return Selection.near($pos);
		}
	};
	/**
	A selection type that represents selecting the whole document
	(which can not necessarily be expressed with a text selection, when
	there are for example leaf block nodes at the start or end of the
	document).
	*/
	var AllSelection = class AllSelection extends Selection {
		/**
		Create an all-selection over the given document.
		*/
		constructor(doc) {
			super(doc.resolve(0), doc.resolve(doc.content.size));
		}
		replace(tr, content = Slice.empty) {
			if (content == Slice.empty) {
				tr.delete(0, tr.doc.content.size);
				let sel = Selection.atStart(tr.doc);
				if (!sel.eq(tr.selection)) tr.setSelection(sel);
			} else super.replace(tr, content);
		}
		toJSON() {
			return { type: "all" };
		}
		/**
		@internal
		*/
		static fromJSON(doc) {
			return new AllSelection(doc);
		}
		map(doc) {
			return new AllSelection(doc);
		}
		eq(other) {
			return other instanceof AllSelection;
		}
		getBookmark() {
			return AllBookmark;
		}
	};
	Selection.jsonID("all", AllSelection);
	var AllBookmark = {
		map() {
			return this;
		},
		resolve(doc) {
			return new AllSelection(doc);
		}
	};
	function findSelectionIn(doc, node, pos, index, dir, text = false) {
		if (node.inlineContent) return TextSelection.create(doc, pos);
		for (let i = index - (dir > 0 ? 0 : 1); dir > 0 ? i < node.childCount : i >= 0; i += dir) {
			let child = node.child(i);
			if (!child.isAtom) {
				let inner = findSelectionIn(doc, child, pos + dir, dir < 0 ? child.childCount : 0, dir, text);
				if (inner) return inner;
			} else if (!text && NodeSelection.isSelectable(child)) return NodeSelection.create(doc, pos - (dir < 0 ? child.nodeSize : 0));
			pos += child.nodeSize * dir;
		}
		return null;
	}
	function selectionToInsertionEnd(tr, startLen, bias) {
		let last = tr.steps.length - 1;
		if (last < startLen) return;
		let step = tr.steps[last];
		if (!(step instanceof ReplaceStep || step instanceof ReplaceAroundStep)) return;
		let map = tr.mapping.maps[last], end;
		map.forEach((_from, _to, _newFrom, newTo) => {
			if (end == null) end = newTo;
		});
		tr.setSelection(Selection.near(tr.doc.resolve(end), bias));
	}
	var UPDATED_SEL = 1, UPDATED_MARKS = 2, UPDATED_SCROLL = 4;
	/**
	An editor state transaction, which can be applied to a state to
	create an updated state. Use
	[`EditorState.tr`](https://prosemirror.net/docs/ref/#state.EditorState.tr) to create an instance.
	
	Transactions track changes to the document (they are a subclass of
	[`Transform`](https://prosemirror.net/docs/ref/#transform.Transform)), but also other state changes,
	like selection updates and adjustments of the set of [stored
	marks](https://prosemirror.net/docs/ref/#state.EditorState.storedMarks). In addition, you can store
	metadata properties in a transaction, which are extra pieces of
	information that client code or plugins can use to describe what a
	transaction represents, so that they can update their [own
	state](https://prosemirror.net/docs/ref/#state.StateField) accordingly.
	
	The [editor view](https://prosemirror.net/docs/ref/#view.EditorView) uses a few metadata
	properties: it will attach a property `"pointer"` with the value
	`true` to selection transactions directly caused by mouse or touch
	input, a `"composition"` property holding an ID identifying the
	composition that caused it to transactions caused by composed DOM
	input, and a `"uiEvent"` property of that may be `"paste"`,
	`"cut"`, or `"drop"`.
	*/
	var Transaction = class extends Transform {
		/**
		@internal
		*/
		constructor(state) {
			super(state.doc);
			this.curSelectionFor = 0;
			this.updated = 0;
			this.meta = Object.create(null);
			this.time = Date.now();
			this.curSelection = state.selection;
			this.storedMarks = state.storedMarks;
		}
		/**
		The transaction's current selection. This defaults to the editor
		selection [mapped](https://prosemirror.net/docs/ref/#state.Selection.map) through the steps in the
		transaction, but can be overwritten with
		[`setSelection`](https://prosemirror.net/docs/ref/#state.Transaction.setSelection).
		*/
		get selection() {
			if (this.curSelectionFor < this.steps.length) {
				this.curSelection = this.curSelection.map(this.doc, this.mapping.slice(this.curSelectionFor));
				this.curSelectionFor = this.steps.length;
			}
			return this.curSelection;
		}
		/**
		Update the transaction's current selection. Will determine the
		selection that the editor gets when the transaction is applied.
		*/
		setSelection(selection) {
			if (selection.$from.doc != this.doc) throw new RangeError("Selection passed to setSelection must point at the current document");
			this.curSelection = selection;
			this.curSelectionFor = this.steps.length;
			this.updated = (this.updated | UPDATED_SEL) & -3;
			this.storedMarks = null;
			return this;
		}
		/**
		Whether the selection was explicitly updated by this transaction.
		*/
		get selectionSet() {
			return (this.updated & UPDATED_SEL) > 0;
		}
		/**
		Set the current stored marks.
		*/
		setStoredMarks(marks) {
			this.storedMarks = marks;
			this.updated |= UPDATED_MARKS;
			return this;
		}
		/**
		Make sure the current stored marks or, if that is null, the marks
		at the selection, match the given set of marks. Does nothing if
		this is already the case.
		*/
		ensureMarks(marks) {
			if (!Mark.sameSet(this.storedMarks || this.selection.$from.marks(), marks)) this.setStoredMarks(marks);
			return this;
		}
		/**
		Add a mark to the set of stored marks.
		*/
		addStoredMark(mark) {
			return this.ensureMarks(mark.addToSet(this.storedMarks || this.selection.$head.marks()));
		}
		/**
		Remove a mark or mark type from the set of stored marks.
		*/
		removeStoredMark(mark) {
			return this.ensureMarks(mark.removeFromSet(this.storedMarks || this.selection.$head.marks()));
		}
		/**
		Whether the stored marks were explicitly set for this transaction.
		*/
		get storedMarksSet() {
			return (this.updated & UPDATED_MARKS) > 0;
		}
		/**
		@internal
		*/
		addStep(step, doc) {
			super.addStep(step, doc);
			this.updated = this.updated & -3;
			this.storedMarks = null;
		}
		/**
		Update the timestamp for the transaction.
		*/
		setTime(time) {
			this.time = time;
			return this;
		}
		/**
		Replace the current selection with the given slice.
		*/
		replaceSelection(slice) {
			this.selection.replace(this, slice);
			return this;
		}
		/**
		Replace the selection with the given node. When `inheritMarks` is
		true and the content is inline, it inherits the marks from the
		place where it is inserted.
		*/
		replaceSelectionWith(node, inheritMarks = true) {
			let selection = this.selection;
			if (inheritMarks) node = node.mark(this.storedMarks || (selection.empty ? selection.$from.marks() : selection.$from.marksAcross(selection.$to) || Mark.none));
			selection.replaceWith(this, node);
			return this;
		}
		/**
		Delete the selection.
		*/
		deleteSelection() {
			this.selection.replace(this);
			return this;
		}
		/**
		Replace the given range, or the selection if no range is given,
		with a text node containing the given string.
		*/
		insertText(text, from, to) {
			let schema = this.doc.type.schema;
			if (from == null) {
				if (!text) return this.deleteSelection();
				return this.replaceSelectionWith(schema.text(text), true);
			} else {
				if (to == null) to = from;
				if (!text) return this.deleteRange(from, to);
				let marks = this.storedMarks;
				if (!marks) {
					let $from = this.doc.resolve(from);
					marks = to == from ? $from.marks() : $from.marksAcross(this.doc.resolve(to));
				}
				this.replaceRangeWith(from, to, schema.text(text, marks));
				if (!this.selection.empty && this.selection.to == from + text.length) this.setSelection(Selection.near(this.selection.$to));
				return this;
			}
		}
		/**
		Store a metadata property in this transaction, keyed either by
		name or by plugin.
		*/
		setMeta(key, value) {
			this.meta[typeof key == "string" ? key : key.key] = value;
			return this;
		}
		/**
		Retrieve a metadata property for a given name or plugin.
		*/
		getMeta(key) {
			return this.meta[typeof key == "string" ? key : key.key];
		}
		/**
		Returns true if this transaction doesn't contain any metadata,
		and can thus safely be extended.
		*/
		get isGeneric() {
			for (let _ in this.meta) return false;
			return true;
		}
		/**
		Indicate that the editor should scroll the selection into view
		when updated to the state produced by this transaction.
		*/
		scrollIntoView() {
			this.updated |= UPDATED_SCROLL;
			return this;
		}
		/**
		True when this transaction has had `scrollIntoView` called on it.
		*/
		get scrolledIntoView() {
			return (this.updated & UPDATED_SCROLL) > 0;
		}
	};
	function bind(f, self) {
		return !self || !f ? f : f.bind(self);
	}
	var FieldDesc = class {
		constructor(name, desc, self) {
			this.name = name;
			this.init = bind(desc.init, self);
			this.apply = bind(desc.apply, self);
		}
	};
	var baseFields = [
		new FieldDesc("doc", {
			init(config) {
				return config.doc || config.schema.topNodeType.createAndFill();
			},
			apply(tr) {
				return tr.doc;
			}
		}),
		new FieldDesc("selection", {
			init(config, instance) {
				return config.selection || Selection.atStart(instance.doc);
			},
			apply(tr) {
				return tr.selection;
			}
		}),
		new FieldDesc("storedMarks", {
			init(config) {
				return config.storedMarks || null;
			},
			apply(tr, _marks, _old, state) {
				return state.selection.$cursor ? tr.storedMarks : null;
			}
		}),
		new FieldDesc("scrollToSelection", {
			init() {
				return 0;
			},
			apply(tr, prev) {
				return tr.scrolledIntoView ? prev + 1 : prev;
			}
		})
	];
	var Configuration = class {
		constructor(schema, plugins) {
			this.schema = schema;
			this.plugins = [];
			this.pluginsByKey = Object.create(null);
			this.fields = baseFields.slice();
			if (plugins) plugins.forEach((plugin) => {
				if (this.pluginsByKey[plugin.key]) throw new RangeError("Adding different instances of a keyed plugin (" + plugin.key + ")");
				this.plugins.push(plugin);
				this.pluginsByKey[plugin.key] = plugin;
				if (plugin.spec.state) this.fields.push(new FieldDesc(plugin.key, plugin.spec.state, plugin));
			});
		}
	};
	/**
	The state of a ProseMirror editor is represented by an object of
	this type. A state is a persistent data structure—it isn't
	updated, but rather a new state value is computed from an old one
	using the [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) method.
	
	A state holds a number of built-in fields, and plugins can
	[define](https://prosemirror.net/docs/ref/#state.PluginSpec.state) additional fields.
	*/
	var EditorState = class EditorState {
		/**
		@internal
		*/
		constructor(config) {
			this.config = config;
		}
		/**
		The schema of the state's document.
		*/
		get schema() {
			return this.config.schema;
		}
		/**
		The plugins that are active in this state.
		*/
		get plugins() {
			return this.config.plugins;
		}
		/**
		Apply the given transaction to produce a new state.
		*/
		apply(tr) {
			return this.applyTransaction(tr).state;
		}
		/**
		@internal
		*/
		filterTransaction(tr, ignore = -1) {
			for (let i = 0; i < this.config.plugins.length; i++) if (i != ignore) {
				let plugin = this.config.plugins[i];
				if (plugin.spec.filterTransaction && !plugin.spec.filterTransaction.call(plugin, tr, this)) return false;
			}
			return true;
		}
		/**
		Verbose variant of [`apply`](https://prosemirror.net/docs/ref/#state.EditorState.apply) that
		returns the precise transactions that were applied (which might
		be influenced by the [transaction
		hooks](https://prosemirror.net/docs/ref/#state.PluginSpec.filterTransaction) of
		plugins) along with the new state.
		*/
		applyTransaction(rootTr) {
			if (!this.filterTransaction(rootTr)) return {
				state: this,
				transactions: []
			};
			let trs = [rootTr], newState = this.applyInner(rootTr), seen = null;
			for (;;) {
				let haveNew = false;
				for (let i = 0; i < this.config.plugins.length; i++) {
					let plugin = this.config.plugins[i];
					if (plugin.spec.appendTransaction) {
						let n = seen ? seen[i].n : 0, oldState = seen ? seen[i].state : this;
						let tr = n < trs.length && plugin.spec.appendTransaction.call(plugin, n ? trs.slice(n) : trs, oldState, newState);
						if (tr && newState.filterTransaction(tr, i)) {
							tr.setMeta("appendedTransaction", rootTr);
							if (!seen) {
								seen = [];
								for (let j = 0; j < this.config.plugins.length; j++) seen.push(j < i ? {
									state: newState,
									n: trs.length
								} : {
									state: this,
									n: 0
								});
							}
							trs.push(tr);
							newState = newState.applyInner(tr);
							haveNew = true;
						}
						if (seen) seen[i] = {
							state: newState,
							n: trs.length
						};
					}
				}
				if (!haveNew) return {
					state: newState,
					transactions: trs
				};
			}
		}
		/**
		@internal
		*/
		applyInner(tr) {
			if (!tr.before.eq(this.doc)) throw new RangeError("Applying a mismatched transaction");
			let newInstance = new EditorState(this.config), fields = this.config.fields;
			for (let i = 0; i < fields.length; i++) {
				let field = fields[i];
				newInstance[field.name] = field.apply(tr, this[field.name], this, newInstance);
			}
			return newInstance;
		}
		/**
		Accessor that constructs and returns a new [transaction](https://prosemirror.net/docs/ref/#state.Transaction) from this state.
		*/
		get tr() {
			return new Transaction(this);
		}
		/**
		Create a new state.
		*/
		static create(config) {
			let $config = new Configuration(config.doc ? config.doc.type.schema : config.schema, config.plugins);
			let instance = new EditorState($config);
			for (let i = 0; i < $config.fields.length; i++) instance[$config.fields[i].name] = $config.fields[i].init(config, instance);
			return instance;
		}
		/**
		Create a new state based on this one, but with an adjusted set
		of active plugins. State fields that exist in both sets of
		plugins are kept unchanged. Those that no longer exist are
		dropped, and those that are new are initialized using their
		[`init`](https://prosemirror.net/docs/ref/#state.StateField.init) method, passing in the new
		configuration object..
		*/
		reconfigure(config) {
			let $config = new Configuration(this.schema, config.plugins);
			let fields = $config.fields, instance = new EditorState($config);
			for (let i = 0; i < fields.length; i++) {
				let name = fields[i].name;
				instance[name] = this.hasOwnProperty(name) ? this[name] : fields[i].init(config, instance);
			}
			return instance;
		}
		/**
		Serialize this state to JSON. If you want to serialize the state
		of plugins, pass an object mapping property names to use in the
		resulting JSON object to plugin objects. The argument may also be
		a string or number, in which case it is ignored, to support the
		way `JSON.stringify` calls `toString` methods.
		*/
		toJSON(pluginFields) {
			let result = {
				doc: this.doc.toJSON(),
				selection: this.selection.toJSON()
			};
			if (this.storedMarks) result.storedMarks = this.storedMarks.map((m) => m.toJSON());
			if (pluginFields && typeof pluginFields == "object") for (let prop in pluginFields) {
				if (prop == "doc" || prop == "selection") throw new RangeError("The JSON fields `doc` and `selection` are reserved");
				let plugin = pluginFields[prop], state = plugin.spec.state;
				if (state && state.toJSON) result[prop] = state.toJSON.call(plugin, this[plugin.key]);
			}
			return result;
		}
		/**
		Deserialize a JSON representation of a state. `config` should
		have at least a `schema` field, and should contain array of
		plugins to initialize the state with. `pluginFields` can be used
		to deserialize the state of plugins, by associating plugin
		instances with the property names they use in the JSON object.
		*/
		static fromJSON(config, json, pluginFields) {
			if (!json) throw new RangeError("Invalid input for EditorState.fromJSON");
			if (!config.schema) throw new RangeError("Required config field 'schema' missing");
			let $config = new Configuration(config.schema, config.plugins);
			let instance = new EditorState($config);
			$config.fields.forEach((field) => {
				if (field.name == "doc") instance.doc = Node.fromJSON(config.schema, json.doc);
				else if (field.name == "selection") instance.selection = Selection.fromJSON(instance.doc, json.selection);
				else if (field.name == "storedMarks") {
					if (json.storedMarks) instance.storedMarks = json.storedMarks.map(config.schema.markFromJSON);
				} else {
					if (pluginFields) for (let prop in pluginFields) {
						let plugin = pluginFields[prop], state = plugin.spec.state;
						if (plugin.key == field.name && state && state.fromJSON && Object.prototype.hasOwnProperty.call(json, prop)) {
							instance[field.name] = state.fromJSON.call(plugin, config, json[prop], instance);
							return;
						}
					}
					instance[field.name] = field.init(config, instance);
				}
			});
			return instance;
		}
	};
	function bindProps(obj, self, target) {
		for (let prop in obj) {
			let val = obj[prop];
			if (val instanceof Function) val = val.bind(self);
			else if (prop == "handleDOMEvents") val = bindProps(val, self, {});
			target[prop] = val;
		}
		return target;
	}
	/**
	Plugins bundle functionality that can be added to an editor.
	They are part of the [editor state](https://prosemirror.net/docs/ref/#state.EditorState) and
	may influence that state and the view that contains it.
	*/
	var Plugin = class {
		/**
		Create a plugin.
		*/
		constructor(spec) {
			this.spec = spec;
			/**
			The [props](https://prosemirror.net/docs/ref/#view.EditorProps) exported by this plugin.
			*/
			this.props = {};
			if (spec.props) bindProps(spec.props, this, this.props);
			this.key = spec.key ? spec.key.key : createKey("plugin");
		}
		/**
		Extract the plugin's state field from an editor state.
		*/
		getState(state) {
			return state[this.key];
		}
	};
	var keys = Object.create(null);
	function createKey(name) {
		if (name in keys) return name + "$" + ++keys[name];
		keys[name] = 0;
		return name + "$";
	}
	/**
	A key is used to [tag](https://prosemirror.net/docs/ref/#state.PluginSpec.key) plugins in a way
	that makes it possible to find them, given an editor state.
	Assigning a key does mean only one plugin of that type can be
	active in a state.
	*/
	var PluginKey = class {
		/**
		Create a plugin key.
		*/
		constructor(name = "key") {
			this.key = createKey(name);
		}
		/**
		Get the active plugin with this key, if any, from an editor
		state.
		*/
		get(state) {
			return state.config.pluginsByKey[this.key];
		}
		/**
		Get the plugin's state from an editor state.
		*/
		getState(state) {
			return state[this.key];
		}
	};
	//#endregion
	//#region node_modules/prosemirror-view/dist/index.js
	var domIndex = function(node) {
		for (var index = 0;; index++) {
			node = node.previousSibling;
			if (!node) return index;
		}
	};
	var parentNode = function(node) {
		let parent = node.assignedSlot || node.parentNode;
		return parent && parent.nodeType == 11 ? parent.host : parent;
	};
	var reusedRange = null;
	var textRange = function(node, from, to) {
		let range = reusedRange || (reusedRange = document.createRange());
		range.setEnd(node, to == null ? node.nodeValue.length : to);
		range.setStart(node, from || 0);
		return range;
	};
	var clearReusedRange = function() {
		reusedRange = null;
	};
	var isEquivalentPosition = function(node, off, targetNode, targetOff) {
		return targetNode && (scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1));
	};
	var atomElements = /^(img|br|input|textarea|hr)$/i;
	function scanFor(node, off, targetNode, targetOff, dir) {
		var _a;
		for (;;) {
			if (node == targetNode && off == targetOff) return true;
			if (off == (dir < 0 ? 0 : nodeSize(node))) {
				let parent = node.parentNode;
				if (!parent || parent.nodeType != 1 || hasBlockDesc(node) || atomElements.test(node.nodeName) || node.contentEditable == "false") return false;
				off = domIndex(node) + (dir < 0 ? 0 : 1);
				node = parent;
			} else if (node.nodeType == 1) {
				let child = node.childNodes[off + (dir < 0 ? -1 : 0)];
				if (child.nodeType == 1 && child.contentEditable == "false") if ((_a = child.pmViewDesc) === null || _a === void 0 ? void 0 : _a.ignoreForSelection) off += dir;
				else return false;
				else {
					node = child;
					off = dir < 0 ? nodeSize(node) : 0;
				}
			} else return false;
		}
	}
	function nodeSize(node) {
		return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
	}
	function textNodeBefore$1(node, offset) {
		for (;;) {
			if (node.nodeType == 3 && offset) return node;
			if (node.nodeType == 1 && offset > 0) {
				if (node.contentEditable == "false") return null;
				node = node.childNodes[offset - 1];
				offset = nodeSize(node);
			} else if (node.parentNode && !hasBlockDesc(node)) {
				offset = domIndex(node);
				node = node.parentNode;
			} else return null;
		}
	}
	function textNodeAfter$1(node, offset) {
		for (;;) {
			if (node.nodeType == 3 && offset < node.nodeValue.length) return node;
			if (node.nodeType == 1 && offset < node.childNodes.length) {
				if (node.contentEditable == "false") return null;
				node = node.childNodes[offset];
				offset = 0;
			} else if (node.parentNode && !hasBlockDesc(node)) {
				offset = domIndex(node) + 1;
				node = node.parentNode;
			} else return null;
		}
	}
	function isOnEdge(node, offset, parent) {
		for (let atStart = offset == 0, atEnd = offset == nodeSize(node); atStart || atEnd;) {
			if (node == parent) return true;
			let index = domIndex(node);
			node = node.parentNode;
			if (!node) return false;
			atStart = atStart && index == 0;
			atEnd = atEnd && index == nodeSize(node);
		}
	}
	function hasBlockDesc(dom) {
		let desc;
		for (let cur = dom; cur; cur = cur.parentNode) if (desc = cur.pmViewDesc) break;
		return desc && desc.node && desc.node.isBlock && (desc.dom == dom || desc.contentDOM == dom);
	}
	var selectionCollapsed = function(domSel) {
		return domSel.focusNode && isEquivalentPosition(domSel.focusNode, domSel.focusOffset, domSel.anchorNode, domSel.anchorOffset);
	};
	function keyEvent(keyCode, key) {
		let event = document.createEvent("Event");
		event.initEvent("keydown", true, true);
		event.keyCode = keyCode;
		event.key = event.code = key;
		return event;
	}
	function deepActiveElement(doc) {
		let elt = doc.activeElement;
		while (elt && elt.shadowRoot) elt = elt.shadowRoot.activeElement;
		return elt;
	}
	function caretFromPoint(doc, x, y) {
		if (doc.caretPositionFromPoint) try {
			let pos = doc.caretPositionFromPoint(x, y);
			if (pos) return {
				node: pos.offsetNode,
				offset: Math.min(nodeSize(pos.offsetNode), pos.offset)
			};
		} catch (_) {}
		if (doc.caretRangeFromPoint) {
			let range = doc.caretRangeFromPoint(x, y);
			if (range) return {
				node: range.startContainer,
				offset: Math.min(nodeSize(range.startContainer), range.startOffset)
			};
		}
	}
	var nav = typeof navigator != "undefined" ? navigator : null;
	var doc = typeof document != "undefined" ? document : null;
	var agent = nav && nav.userAgent || "";
	var ie_edge = /Edge\/(\d+)/.exec(agent);
	var ie_upto10 = /MSIE \d/.exec(agent);
	var ie_11up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(agent);
	var ie$1 = !!(ie_upto10 || ie_11up || ie_edge);
	var ie_version = ie_upto10 ? document.documentMode : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0;
	var gecko = !ie$1 && /gecko\/(\d+)/i.test(agent);
	gecko && +(/Firefox\/(\d+)/.exec(agent) || [0, 0])[1];
	var _chrome = !ie$1 && /Chrome\/(\d+)/.exec(agent);
	var chrome = !!_chrome;
	var chrome_version = _chrome ? +_chrome[1] : 0;
	var safari = !ie$1 && !!nav && /Apple Computer/.test(nav.vendor);
	var ios = safari && (/Mobile\/\w+/.test(agent) || !!nav && nav.maxTouchPoints > 2);
	var mac$2 = ios || (nav ? /Mac/.test(nav.platform) : false);
	var windows$1 = nav ? /Win/.test(nav.platform) : false;
	var android = /Android \d/.test(agent);
	var webkit = !!doc && "webkitFontSmoothing" in doc.documentElement.style;
	var webkit_version = webkit ? +(/\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0;
	function windowRect(doc) {
		let vp = doc.defaultView && doc.defaultView.visualViewport;
		if (vp) return {
			left: 0,
			right: vp.width,
			top: 0,
			bottom: vp.height
		};
		return {
			left: 0,
			right: doc.documentElement.clientWidth,
			top: 0,
			bottom: doc.documentElement.clientHeight
		};
	}
	function getSide(value, side) {
		return typeof value == "number" ? value : value[side];
	}
	function clientRect(node) {
		let rect = node.getBoundingClientRect();
		let scaleX = rect.width / node.offsetWidth || 1;
		let scaleY = rect.height / node.offsetHeight || 1;
		return {
			left: rect.left,
			right: rect.left + node.clientWidth * scaleX,
			top: rect.top,
			bottom: rect.top + node.clientHeight * scaleY
		};
	}
	function scrollRectIntoView(view, rect, startDOM) {
		let scrollThreshold = view.someProp("scrollThreshold") || 0, scrollMargin = view.someProp("scrollMargin") || 5;
		let doc = view.dom.ownerDocument;
		for (let parent = startDOM || view.dom;;) {
			if (!parent) break;
			if (parent.nodeType != 1) {
				parent = parentNode(parent);
				continue;
			}
			let elt = parent;
			let atTop = elt == doc.body;
			let bounding = atTop ? windowRect(doc) : clientRect(elt);
			let moveX = 0, moveY = 0;
			if (rect.top < bounding.top + getSide(scrollThreshold, "top")) moveY = -(bounding.top - rect.top + getSide(scrollMargin, "top"));
			else if (rect.bottom > bounding.bottom - getSide(scrollThreshold, "bottom")) moveY = rect.bottom - rect.top > bounding.bottom - bounding.top ? rect.top + getSide(scrollMargin, "top") - bounding.top : rect.bottom - bounding.bottom + getSide(scrollMargin, "bottom");
			if (rect.left < bounding.left + getSide(scrollThreshold, "left")) moveX = -(bounding.left - rect.left + getSide(scrollMargin, "left"));
			else if (rect.right > bounding.right - getSide(scrollThreshold, "right")) moveX = rect.right - bounding.right + getSide(scrollMargin, "right");
			if (moveX || moveY) if (atTop) doc.defaultView.scrollBy(moveX, moveY);
			else {
				let startX = elt.scrollLeft, startY = elt.scrollTop;
				if (moveY) elt.scrollTop += moveY;
				if (moveX) elt.scrollLeft += moveX;
				let dX = elt.scrollLeft - startX, dY = elt.scrollTop - startY;
				rect = {
					left: rect.left - dX,
					top: rect.top - dY,
					right: rect.right - dX,
					bottom: rect.bottom - dY
				};
			}
			let pos = atTop ? "fixed" : getComputedStyle(parent).position;
			if (/^(fixed|sticky)$/.test(pos)) break;
			parent = pos == "absolute" ? parent.offsetParent : parentNode(parent);
		}
	}
	function storeScrollPos(view) {
		let rect = view.dom.getBoundingClientRect(), startY = Math.max(0, rect.top);
		let refDOM, refTop;
		for (let x = (rect.left + rect.right) / 2, y = startY + 1; y < Math.min(innerHeight, rect.bottom); y += 5) {
			let dom = view.root.elementFromPoint(x, y);
			if (!dom || dom == view.dom || !view.dom.contains(dom)) continue;
			let localRect = dom.getBoundingClientRect();
			if (localRect.top >= startY - 20) {
				refDOM = dom;
				refTop = localRect.top;
				break;
			}
		}
		return {
			refDOM,
			refTop,
			stack: scrollStack(view.dom)
		};
	}
	function scrollStack(dom) {
		let stack = [], doc = dom.ownerDocument;
		for (let cur = dom; cur; cur = parentNode(cur)) {
			stack.push({
				dom: cur,
				top: cur.scrollTop,
				left: cur.scrollLeft
			});
			if (dom == doc) break;
		}
		return stack;
	}
	function resetScrollPos({ refDOM, refTop, stack }) {
		let newRefTop = refDOM ? refDOM.getBoundingClientRect().top : 0;
		restoreScrollStack(stack, newRefTop == 0 ? 0 : newRefTop - refTop);
	}
	function restoreScrollStack(stack, dTop) {
		for (let i = 0; i < stack.length; i++) {
			let { dom, top, left } = stack[i];
			if (dom.scrollTop != top + dTop) dom.scrollTop = top + dTop;
			if (dom.scrollLeft != left) dom.scrollLeft = left;
		}
	}
	var preventScrollSupported = null;
	function focusPreventScroll(dom) {
		if (dom.setActive) return dom.setActive();
		if (preventScrollSupported) return dom.focus(preventScrollSupported);
		let stored = scrollStack(dom);
		dom.focus(preventScrollSupported == null ? { get preventScroll() {
			preventScrollSupported = { preventScroll: true };
			return true;
		} } : void 0);
		if (!preventScrollSupported) {
			preventScrollSupported = false;
			restoreScrollStack(stored, 0);
		}
	}
	function findOffsetInNode(node, coords) {
		let closest, dxClosest = 2e8, coordsClosest, offset = 0;
		let rowBot = coords.top, rowTop = coords.top;
		let firstBelow, coordsBelow;
		for (let child = node.firstChild, childIndex = 0; child; child = child.nextSibling, childIndex++) {
			let rects;
			if (child.nodeType == 1) rects = child.getClientRects();
			else if (child.nodeType == 3) rects = textRange(child).getClientRects();
			else continue;
			for (let i = 0; i < rects.length; i++) {
				let rect = rects[i];
				if (rect.top <= rowBot && rect.bottom >= rowTop) {
					rowBot = Math.max(rect.bottom, rowBot);
					rowTop = Math.min(rect.top, rowTop);
					let dx = rect.left > coords.left ? rect.left - coords.left : rect.right < coords.left ? coords.left - rect.right : 0;
					if (dx < dxClosest) {
						closest = child;
						dxClosest = dx;
						coordsClosest = dx && closest.nodeType == 3 ? {
							left: rect.right < coords.left ? rect.right : rect.left,
							top: coords.top
						} : coords;
						if (child.nodeType == 1 && dx) offset = childIndex + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0);
						continue;
					}
				} else if (rect.top > coords.top && !firstBelow && rect.left <= coords.left && rect.right >= coords.left) {
					firstBelow = child;
					coordsBelow = {
						left: Math.max(rect.left, Math.min(rect.right, coords.left)),
						top: rect.top
					};
				}
				if (!closest && (coords.left >= rect.right && coords.top >= rect.top || coords.left >= rect.left && coords.top >= rect.bottom)) offset = childIndex + 1;
			}
		}
		if (!closest && firstBelow) {
			closest = firstBelow;
			coordsClosest = coordsBelow;
			dxClosest = 0;
		}
		if (closest && closest.nodeType == 3) return findOffsetInText(closest, coordsClosest);
		if (!closest || dxClosest && closest.nodeType == 1) return {
			node,
			offset
		};
		return findOffsetInNode(closest, coordsClosest);
	}
	function findOffsetInText(node, coords) {
		let len = node.nodeValue.length;
		let range = document.createRange(), result;
		for (let i = 0; i < len; i++) {
			range.setEnd(node, i + 1);
			range.setStart(node, i);
			let rect = singleRect(range, 1);
			if (rect.top == rect.bottom) continue;
			if (inRect(coords, rect)) {
				result = {
					node,
					offset: i + (coords.left >= (rect.left + rect.right) / 2 ? 1 : 0)
				};
				break;
			}
		}
		range.detach();
		return result || {
			node,
			offset: 0
		};
	}
	function inRect(coords, rect) {
		return coords.left >= rect.left - 1 && coords.left <= rect.right + 1 && coords.top >= rect.top - 1 && coords.top <= rect.bottom + 1;
	}
	function targetKludge(dom, coords) {
		let parent = dom.parentNode;
		if (parent && /^li$/i.test(parent.nodeName) && coords.left < dom.getBoundingClientRect().left) return parent;
		return dom;
	}
	function posFromElement(view, elt, coords) {
		let { node, offset } = findOffsetInNode(elt, coords), bias = -1;
		if (node.nodeType == 1 && !node.firstChild) {
			let rect = node.getBoundingClientRect();
			bias = rect.left != rect.right && coords.left > (rect.left + rect.right) / 2 ? 1 : -1;
		}
		return view.docView.posFromDOM(node, offset, bias);
	}
	function posFromCaret(view, node, offset, coords) {
		let outsideBlock = -1;
		for (let cur = node, sawBlock = false;;) {
			if (cur == view.dom) break;
			let desc = view.docView.nearestDesc(cur, true), rect;
			if (!desc) return null;
			if (desc.dom.nodeType == 1 && (desc.node.isBlock && desc.parent || !desc.contentDOM) && ((rect = desc.dom.getBoundingClientRect()).width || rect.height)) {
				if (desc.node.isBlock && desc.parent && !/^T(R|BODY|HEAD|FOOT)$/.test(desc.dom.nodeName)) {
					if (!sawBlock && rect.left > coords.left || rect.top > coords.top) outsideBlock = desc.posBefore;
					else if (!sawBlock && rect.right < coords.left || rect.bottom < coords.top) outsideBlock = desc.posAfter;
					sawBlock = true;
				}
				if (!desc.contentDOM && outsideBlock < 0 && !desc.node.isText) return (desc.node.isBlock ? coords.top < (rect.top + rect.bottom) / 2 : coords.left < (rect.left + rect.right) / 2) ? desc.posBefore : desc.posAfter;
			}
			cur = desc.dom.parentNode;
		}
		return outsideBlock > -1 ? outsideBlock : view.docView.posFromDOM(node, offset, -1);
	}
	function elementFromPoint(element, coords, box) {
		let len = element.childNodes.length;
		if (len && box.top < box.bottom) for (let startI = Math.max(0, Math.min(len - 1, Math.floor(len * (coords.top - box.top) / (box.bottom - box.top)) - 2)), i = startI;;) {
			let child = element.childNodes[i];
			if (child.nodeType == 1) {
				let rects = child.getClientRects();
				for (let j = 0; j < rects.length; j++) {
					let rect = rects[j];
					if (inRect(coords, rect)) return elementFromPoint(child, coords, rect);
				}
			}
			if ((i = (i + 1) % len) == startI) break;
		}
		return element;
	}
	function posAtCoords(view, coords) {
		let doc = view.dom.ownerDocument, node, offset = 0;
		let caret = caretFromPoint(doc, coords.left, coords.top);
		if (caret) ({node, offset} = caret);
		let elt = (view.root.elementFromPoint ? view.root : doc).elementFromPoint(coords.left, coords.top);
		let pos;
		if (!elt || !view.dom.contains(elt.nodeType != 1 ? elt.parentNode : elt)) {
			let box = view.dom.getBoundingClientRect();
			if (!inRect(coords, box)) return null;
			elt = elementFromPoint(view.dom, coords, box);
			if (!elt) return null;
		}
		if (safari) {
			for (let p = elt; node && p; p = parentNode(p)) if (p.draggable) node = void 0;
		}
		elt = targetKludge(elt, coords);
		if (node) {
			if (gecko && node.nodeType == 1) {
				offset = Math.min(offset, node.childNodes.length);
				if (offset < node.childNodes.length) {
					let next = node.childNodes[offset], box;
					if (next.nodeName == "IMG" && (box = next.getBoundingClientRect()).right <= coords.left && box.bottom > coords.top) offset++;
				}
			}
			let prev;
			if (webkit && offset && node.nodeType == 1 && (prev = node.childNodes[offset - 1]).nodeType == 1 && prev.contentEditable == "false" && prev.getBoundingClientRect().top >= coords.top) offset--;
			if (node == view.dom && offset == node.childNodes.length - 1 && node.lastChild.nodeType == 1 && coords.top > node.lastChild.getBoundingClientRect().bottom) pos = view.state.doc.content.size;
			else if (offset == 0 || node.nodeType != 1 || node.childNodes[offset - 1].nodeName != "BR") pos = posFromCaret(view, node, offset, coords);
		}
		if (pos == null) pos = posFromElement(view, elt, coords);
		let desc = view.docView.nearestDesc(elt, true);
		return {
			pos,
			inside: desc ? desc.posAtStart - desc.border : -1
		};
	}
	function nonZero(rect) {
		return rect.top < rect.bottom || rect.left < rect.right;
	}
	function singleRect(target, bias) {
		let rects = target.getClientRects();
		if (rects.length) {
			let first = rects[bias < 0 ? 0 : rects.length - 1];
			if (nonZero(first)) return first;
		}
		return Array.prototype.find.call(rects, nonZero) || target.getBoundingClientRect();
	}
	var BIDI = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
	function coordsAtPos(view, pos, side) {
		let { node, offset, atom } = view.docView.domFromPos(pos, side < 0 ? -1 : 1);
		let supportEmptyRange = webkit || gecko;
		if (node.nodeType == 3) if (supportEmptyRange && (BIDI.test(node.nodeValue) || (side < 0 ? !offset : offset == node.nodeValue.length))) {
			let rect = singleRect(textRange(node, offset, offset), side);
			if (gecko && offset && /\s/.test(node.nodeValue[offset - 1]) && offset < node.nodeValue.length) {
				let rectBefore = singleRect(textRange(node, offset - 1, offset - 1), -1);
				if (rectBefore.top == rect.top) {
					let rectAfter = singleRect(textRange(node, offset, offset + 1), -1);
					if (rectAfter.top != rect.top) return flattenV(rectAfter, rectAfter.left < rectBefore.left);
				}
			}
			return rect;
		} else {
			let from = offset, to = offset, takeSide = side < 0 ? 1 : -1;
			if (side < 0 && !offset) {
				to++;
				takeSide = -1;
			} else if (side >= 0 && offset == node.nodeValue.length) {
				from--;
				takeSide = 1;
			} else if (side < 0) from--;
			else to++;
			return flattenV(singleRect(textRange(node, from, to), takeSide), takeSide < 0);
		}
		if (!view.state.doc.resolve(pos - (atom || 0)).parent.inlineContent) {
			if (atom == null && offset && (side < 0 || offset == nodeSize(node))) {
				let before = node.childNodes[offset - 1];
				if (before.nodeType == 1) return flattenH(before.getBoundingClientRect(), false);
			}
			if (atom == null && offset < nodeSize(node)) {
				let after = node.childNodes[offset];
				if (after.nodeType == 1) return flattenH(after.getBoundingClientRect(), true);
			}
			return flattenH(node.getBoundingClientRect(), side >= 0);
		}
		if (atom == null && offset && (side < 0 || offset == nodeSize(node))) {
			let before = node.childNodes[offset - 1];
			let target = before.nodeType == 3 ? textRange(before, nodeSize(before) - (supportEmptyRange ? 0 : 1)) : before.nodeType == 1 && (before.nodeName != "BR" || !before.nextSibling) ? before : null;
			if (target) return flattenV(singleRect(target, 1), false);
		}
		if (atom == null && offset < nodeSize(node)) {
			let after = node.childNodes[offset];
			while (after.pmViewDesc && after.pmViewDesc.ignoreForCoords) after = after.nextSibling;
			let target = !after ? null : after.nodeType == 3 ? textRange(after, 0, supportEmptyRange ? 0 : 1) : after.nodeType == 1 ? after : null;
			if (target) return flattenV(singleRect(target, -1), true);
		}
		return flattenV(singleRect(node.nodeType == 3 ? textRange(node) : node, -side), side >= 0);
	}
	function flattenV(rect, left) {
		if (rect.width == 0) return rect;
		let x = left ? rect.left : rect.right;
		return {
			top: rect.top,
			bottom: rect.bottom,
			left: x,
			right: x
		};
	}
	function flattenH(rect, top) {
		if (rect.height == 0) return rect;
		let y = top ? rect.top : rect.bottom;
		return {
			top: y,
			bottom: y,
			left: rect.left,
			right: rect.right
		};
	}
	function withFlushedState(view, state, f) {
		let viewState = view.state, active = view.root.activeElement;
		if (viewState != state) view.updateState(state);
		if (active != view.dom) view.focus();
		try {
			return f();
		} finally {
			if (viewState != state) view.updateState(viewState);
			if (active != view.dom && active) active.focus();
		}
	}
	function endOfTextblockVertical(view, state, dir) {
		let sel = state.selection;
		let $pos = dir == "up" ? sel.$from : sel.$to;
		return withFlushedState(view, state, () => {
			let { node: dom } = view.docView.domFromPos($pos.pos, dir == "up" ? -1 : 1);
			for (;;) {
				let nearest = view.docView.nearestDesc(dom, true);
				if (!nearest) break;
				if (nearest.node.isBlock) {
					dom = nearest.contentDOM || nearest.dom;
					break;
				}
				dom = nearest.dom.parentNode;
			}
			let coords = coordsAtPos(view, $pos.pos, 1);
			for (let child = dom.firstChild; child; child = child.nextSibling) {
				let boxes;
				if (child.nodeType == 1) boxes = child.getClientRects();
				else if (child.nodeType == 3) boxes = textRange(child, 0, child.nodeValue.length).getClientRects();
				else continue;
				for (let i = 0; i < boxes.length; i++) {
					let box = boxes[i];
					if (box.bottom > box.top + 1 && (dir == "up" ? coords.top - box.top > (box.bottom - coords.top) * 2 : box.bottom - coords.bottom > (coords.bottom - box.top) * 2)) return false;
				}
			}
			return true;
		});
	}
	var maybeRTL = /[\u0590-\u08ac]/;
	function endOfTextblockHorizontal(view, state, dir) {
		let { $head } = state.selection;
		if (!$head.parent.isTextblock) return false;
		let offset = $head.parentOffset, atStart = !offset, atEnd = offset == $head.parent.content.size;
		let sel = view.domSelection();
		if (!sel) return $head.pos == $head.start() || $head.pos == $head.end();
		if (!maybeRTL.test($head.parent.textContent) || !sel.modify) return dir == "left" || dir == "backward" ? atStart : atEnd;
		return withFlushedState(view, state, () => {
			let { focusNode: oldNode, focusOffset: oldOff, anchorNode, anchorOffset } = view.domSelectionRange();
			let oldBidiLevel = sel.caretBidiLevel;
			sel.modify("move", dir, "character");
			let parentDOM = $head.depth ? view.docView.domAfterPos($head.before()) : view.dom;
			let { focusNode: newNode, focusOffset: newOff } = view.domSelectionRange();
			let result = newNode && !parentDOM.contains(newNode.nodeType == 1 ? newNode : newNode.parentNode) || oldNode == newNode && oldOff == newOff;
			try {
				sel.collapse(anchorNode, anchorOffset);
				if (oldNode && (oldNode != anchorNode || oldOff != anchorOffset) && sel.extend) sel.extend(oldNode, oldOff);
			} catch (_) {}
			if (oldBidiLevel != null) sel.caretBidiLevel = oldBidiLevel;
			return result;
		});
	}
	var cachedState = null;
	var cachedDir = null;
	var cachedResult = false;
	function endOfTextblock(view, state, dir) {
		if (cachedState == state && cachedDir == dir) return cachedResult;
		cachedState = state;
		cachedDir = dir;
		return cachedResult = dir == "up" || dir == "down" ? endOfTextblockVertical(view, state, dir) : endOfTextblockHorizontal(view, state, dir);
	}
	var NOT_DIRTY = 0, CHILD_DIRTY = 1, CONTENT_DIRTY = 2, NODE_DIRTY = 3;
	var ViewDesc = class {
		constructor(parent, children, dom, contentDOM) {
			this.parent = parent;
			this.children = children;
			this.dom = dom;
			this.contentDOM = contentDOM;
			this.dirty = NOT_DIRTY;
			dom.pmViewDesc = this;
		}
		matchesWidget(widget) {
			return false;
		}
		matchesMark(mark) {
			return false;
		}
		matchesNode(node, outerDeco, innerDeco) {
			return false;
		}
		matchesHack(nodeName) {
			return false;
		}
		parseRule() {
			return null;
		}
		stopEvent(event) {
			return false;
		}
		get size() {
			let size = 0;
			for (let i = 0; i < this.children.length; i++) size += this.children[i].size;
			return size;
		}
		get border() {
			return 0;
		}
		destroy() {
			this.parent = void 0;
			if (this.dom.pmViewDesc == this) this.dom.pmViewDesc = void 0;
			for (let i = 0; i < this.children.length; i++) this.children[i].destroy();
		}
		posBeforeChild(child) {
			for (let i = 0, pos = this.posAtStart;; i++) {
				let cur = this.children[i];
				if (cur == child) return pos;
				pos += cur.size;
			}
		}
		get posBefore() {
			return this.parent.posBeforeChild(this);
		}
		get posAtStart() {
			return this.parent ? this.parent.posBeforeChild(this) + this.border : 0;
		}
		get posAfter() {
			return this.posBefore + this.size;
		}
		get posAtEnd() {
			return this.posAtStart + this.size - 2 * this.border;
		}
		localPosFromDOM(dom, offset, bias) {
			if (this.contentDOM && this.contentDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode)) if (bias < 0) {
				let domBefore, desc;
				if (dom == this.contentDOM) domBefore = dom.childNodes[offset - 1];
				else {
					while (dom.parentNode != this.contentDOM) dom = dom.parentNode;
					domBefore = dom.previousSibling;
				}
				while (domBefore && !((desc = domBefore.pmViewDesc) && desc.parent == this)) domBefore = domBefore.previousSibling;
				return domBefore ? this.posBeforeChild(desc) + desc.size : this.posAtStart;
			} else {
				let domAfter, desc;
				if (dom == this.contentDOM) domAfter = dom.childNodes[offset];
				else {
					while (dom.parentNode != this.contentDOM) dom = dom.parentNode;
					domAfter = dom.nextSibling;
				}
				while (domAfter && !((desc = domAfter.pmViewDesc) && desc.parent == this)) domAfter = domAfter.nextSibling;
				return domAfter ? this.posBeforeChild(desc) : this.posAtEnd;
			}
			let atEnd;
			if (dom == this.dom && this.contentDOM) atEnd = offset > domIndex(this.contentDOM);
			else if (this.contentDOM && this.contentDOM != this.dom && this.dom.contains(this.contentDOM)) atEnd = dom.compareDocumentPosition(this.contentDOM) & 2;
			else if (this.dom.firstChild) {
				if (offset == 0) for (let search = dom;; search = search.parentNode) {
					if (search == this.dom) {
						atEnd = false;
						break;
					}
					if (search.previousSibling) break;
				}
				if (atEnd == null && offset == dom.childNodes.length) for (let search = dom;; search = search.parentNode) {
					if (search == this.dom) {
						atEnd = true;
						break;
					}
					if (search.nextSibling) break;
				}
			}
			return (atEnd == null ? bias > 0 : atEnd) ? this.posAtEnd : this.posAtStart;
		}
		nearestDesc(dom, onlyNodes = false) {
			for (let first = true, cur = dom; cur; cur = cur.parentNode) {
				let desc = this.getDesc(cur), nodeDOM;
				if (desc && (!onlyNodes || desc.node)) if (first && (nodeDOM = desc.nodeDOM) && !(nodeDOM.nodeType == 1 ? nodeDOM.contains(dom.nodeType == 1 ? dom : dom.parentNode) : nodeDOM == dom)) first = false;
				else return desc;
			}
		}
		getDesc(dom) {
			let desc = dom.pmViewDesc;
			for (let cur = desc; cur; cur = cur.parent) if (cur == this) return desc;
		}
		posFromDOM(dom, offset, bias) {
			for (let scan = dom; scan; scan = scan.parentNode) {
				let desc = this.getDesc(scan);
				if (desc) return desc.localPosFromDOM(dom, offset, bias);
			}
			return -1;
		}
		descAt(pos) {
			for (let i = 0, offset = 0; i < this.children.length; i++) {
				let child = this.children[i], end = offset + child.size;
				if (offset == pos && end != offset) {
					while (!child.border && child.children.length) for (let i = 0; i < child.children.length; i++) {
						let inner = child.children[i];
						if (inner.size) {
							child = inner;
							break;
						}
					}
					return child;
				}
				if (pos < end) return child.descAt(pos - offset - child.border);
				offset = end;
			}
		}
		domFromPos(pos, side) {
			if (!this.contentDOM) return {
				node: this.dom,
				offset: 0,
				atom: pos + 1
			};
			let i = 0, offset = 0;
			for (let curPos = 0; i < this.children.length; i++) {
				let child = this.children[i], end = curPos + child.size;
				if (end > pos || child instanceof TrailingHackViewDesc) {
					offset = pos - curPos;
					break;
				}
				curPos = end;
			}
			if (offset) return this.children[i].domFromPos(offset - this.children[i].border, side);
			for (let prev; i && !(prev = this.children[i - 1]).size && prev instanceof WidgetViewDesc && prev.side >= 0; i--);
			if (side <= 0) {
				let prev, enter = true;
				for (;; i--, enter = false) {
					prev = i ? this.children[i - 1] : null;
					if (!prev || prev.dom.parentNode == this.contentDOM) break;
				}
				if (prev && side && enter && !prev.border && !prev.domAtom) return prev.domFromPos(prev.size, side);
				return {
					node: this.contentDOM,
					offset: prev ? domIndex(prev.dom) + 1 : 0
				};
			} else {
				let next, enter = true;
				for (;; i++, enter = false) {
					next = i < this.children.length ? this.children[i] : null;
					if (!next || next.dom.parentNode == this.contentDOM) break;
				}
				if (next && enter && !next.border && !next.domAtom) return next.domFromPos(0, side);
				return {
					node: this.contentDOM,
					offset: next ? domIndex(next.dom) : this.contentDOM.childNodes.length
				};
			}
		}
		parseRange(from, to, base = 0) {
			if (this.children.length == 0) return {
				node: this.contentDOM,
				from,
				to,
				fromOffset: 0,
				toOffset: this.contentDOM.childNodes.length
			};
			let fromOffset = -1, toOffset = -1;
			for (let offset = base, i = 0;; i++) {
				let child = this.children[i], end = offset + child.size;
				if (fromOffset == -1 && from <= end) {
					let childBase = offset + child.border;
					if (from >= childBase && to <= end - child.border && child.node && child.contentDOM && this.contentDOM.contains(child.contentDOM)) return child.parseRange(from, to, childBase);
					from = offset;
					for (let j = i; j > 0; j--) {
						let prev = this.children[j - 1];
						if (prev.size && prev.dom.parentNode == this.contentDOM && !prev.emptyChildAt(1)) {
							fromOffset = domIndex(prev.dom) + 1;
							break;
						}
						from -= prev.size;
					}
					if (fromOffset == -1) fromOffset = 0;
				}
				if (fromOffset > -1 && (end > to || i == this.children.length - 1)) {
					to = end;
					for (let j = i + 1; j < this.children.length; j++) {
						let next = this.children[j];
						if (next.size && next.dom.parentNode == this.contentDOM && !next.emptyChildAt(-1)) {
							toOffset = domIndex(next.dom);
							break;
						}
						to += next.size;
					}
					if (toOffset == -1) toOffset = this.contentDOM.childNodes.length;
					break;
				}
				offset = end;
			}
			return {
				node: this.contentDOM,
				from,
				to,
				fromOffset,
				toOffset
			};
		}
		emptyChildAt(side) {
			if (this.border || !this.contentDOM || !this.children.length) return false;
			let child = this.children[side < 0 ? 0 : this.children.length - 1];
			return child.size == 0 || child.emptyChildAt(side);
		}
		domAfterPos(pos) {
			let { node, offset } = this.domFromPos(pos, 0);
			if (node.nodeType != 1 || offset == node.childNodes.length) throw new RangeError("No node after pos " + pos);
			return node.childNodes[offset];
		}
		setSelection(anchor, head, view, force = false) {
			let from = Math.min(anchor, head), to = Math.max(anchor, head);
			for (let i = 0, offset = 0; i < this.children.length; i++) {
				let child = this.children[i], end = offset + child.size;
				if (from > offset && to < end) return child.setSelection(anchor - offset - child.border, head - offset - child.border, view, force);
				offset = end;
			}
			let anchorDOM = this.domFromPos(anchor, anchor ? -1 : 1);
			let headDOM = head == anchor ? anchorDOM : this.domFromPos(head, head ? -1 : 1);
			let domSel = view.root.getSelection();
			let selRange = view.domSelectionRange();
			let brKludge = false;
			if ((gecko || safari) && anchor == head) {
				let { node, offset } = anchorDOM;
				if (node.nodeType == 3) {
					brKludge = !!(offset && node.nodeValue[offset - 1] == "\n");
					if (brKludge && offset == node.nodeValue.length) for (let scan = node, after; scan; scan = scan.parentNode) {
						if (after = scan.nextSibling) {
							if (after.nodeName == "BR") anchorDOM = headDOM = {
								node: after.parentNode,
								offset: domIndex(after) + 1
							};
							break;
						}
						let desc = scan.pmViewDesc;
						if (desc && desc.node && desc.node.isBlock) break;
					}
				} else {
					let prev = node.childNodes[offset - 1];
					brKludge = prev && (prev.nodeName == "BR" || prev.contentEditable == "false");
				}
			}
			if (gecko && selRange.focusNode && selRange.focusNode != headDOM.node && selRange.focusNode.nodeType == 1) {
				let after = selRange.focusNode.childNodes[selRange.focusOffset];
				if (after && after.contentEditable == "false") force = true;
			}
			if (!(force || brKludge && safari) && isEquivalentPosition(anchorDOM.node, anchorDOM.offset, selRange.anchorNode, selRange.anchorOffset) && isEquivalentPosition(headDOM.node, headDOM.offset, selRange.focusNode, selRange.focusOffset)) return;
			let domSelExtended = false;
			if ((domSel.extend || anchor == head) && !(brKludge && gecko)) {
				domSel.collapse(anchorDOM.node, anchorDOM.offset);
				try {
					if (anchor != head) domSel.extend(headDOM.node, headDOM.offset);
					domSelExtended = true;
				} catch (_) {}
			}
			if (!domSelExtended) {
				if (anchor > head) {
					let tmp = anchorDOM;
					anchorDOM = headDOM;
					headDOM = tmp;
				}
				let range = document.createRange();
				range.setEnd(headDOM.node, headDOM.offset);
				range.setStart(anchorDOM.node, anchorDOM.offset);
				domSel.removeAllRanges();
				domSel.addRange(range);
			}
		}
		ignoreMutation(mutation) {
			return !this.contentDOM && mutation.type != "selection";
		}
		get contentLost() {
			return this.contentDOM && this.contentDOM != this.dom && !this.dom.contains(this.contentDOM);
		}
		markDirty(from, to) {
			for (let offset = 0, i = 0; i < this.children.length; i++) {
				let child = this.children[i], end = offset + child.size;
				if (offset == end ? from <= end && to >= offset : from < end && to > offset) {
					let startInside = offset + child.border, endInside = end - child.border;
					if (from >= startInside && to <= endInside) {
						this.dirty = from == offset || to == end ? CONTENT_DIRTY : CHILD_DIRTY;
						if (from == startInside && to == endInside && (child.contentLost || child.dom.parentNode != this.contentDOM)) child.dirty = NODE_DIRTY;
						else child.markDirty(from - startInside, to - startInside);
						return;
					} else child.dirty = child.dom == child.contentDOM && child.dom.parentNode == this.contentDOM && !child.children.length ? CONTENT_DIRTY : NODE_DIRTY;
				}
				offset = end;
			}
			this.dirty = CONTENT_DIRTY;
		}
		markParentsDirty() {
			let level = 1;
			for (let node = this.parent; node; node = node.parent, level++) {
				let dirty = level == 1 ? CONTENT_DIRTY : CHILD_DIRTY;
				if (node.dirty < dirty) node.dirty = dirty;
			}
		}
		get domAtom() {
			return false;
		}
		get ignoreForCoords() {
			return false;
		}
		get ignoreForSelection() {
			return false;
		}
		isText(text) {
			return false;
		}
	};
	var WidgetViewDesc = class extends ViewDesc {
		constructor(parent, widget, view, pos) {
			let self, dom = widget.type.toDOM;
			if (typeof dom == "function") dom = dom(view, () => {
				if (!self) return pos;
				if (self.parent) return self.parent.posBeforeChild(self);
			});
			if (!widget.type.spec.raw) {
				if (dom.nodeType != 1) {
					let wrap = document.createElement("span");
					wrap.appendChild(dom);
					dom = wrap;
				}
				dom.contentEditable = "false";
				dom.classList.add("ProseMirror-widget");
			}
			super(parent, [], dom, null);
			this.widget = widget;
			this.widget = widget;
			self = this;
		}
		matchesWidget(widget) {
			return this.dirty == NOT_DIRTY && widget.type.eq(this.widget.type);
		}
		parseRule() {
			return { ignore: true };
		}
		stopEvent(event) {
			let stop = this.widget.spec.stopEvent;
			return stop ? stop(event) : false;
		}
		ignoreMutation(mutation) {
			return mutation.type != "selection" || this.widget.spec.ignoreSelection;
		}
		destroy() {
			this.widget.type.destroy(this.dom);
			super.destroy();
		}
		get domAtom() {
			return true;
		}
		get ignoreForSelection() {
			return !!this.widget.type.spec.relaxedSide;
		}
		get side() {
			return this.widget.type.side;
		}
	};
	var CompositionViewDesc = class extends ViewDesc {
		constructor(parent, dom, textDOM, text) {
			super(parent, [], dom, null);
			this.textDOM = textDOM;
			this.text = text;
		}
		get size() {
			return this.text.length;
		}
		localPosFromDOM(dom, offset) {
			if (dom != this.textDOM) return this.posAtStart + (offset ? this.size : 0);
			return this.posAtStart + offset;
		}
		domFromPos(pos) {
			return {
				node: this.textDOM,
				offset: pos
			};
		}
		ignoreMutation(mut) {
			return mut.type === "characterData" && mut.target.nodeValue == mut.oldValue;
		}
	};
	var MarkViewDesc = class MarkViewDesc extends ViewDesc {
		constructor(parent, mark, dom, contentDOM, spec) {
			super(parent, [], dom, contentDOM);
			this.mark = mark;
			this.spec = spec;
		}
		static create(parent, mark, inline, view) {
			let custom = view.nodeViews[mark.type.name];
			let spec = custom && custom(mark, view, inline);
			if (!spec || !spec.dom) spec = DOMSerializer.renderSpec(document, mark.type.spec.toDOM(mark, inline), null, mark.attrs);
			return new MarkViewDesc(parent, mark, spec.dom, spec.contentDOM || spec.dom, spec);
		}
		parseRule() {
			if (this.dirty & NODE_DIRTY || this.mark.type.spec.reparseInView) return null;
			return {
				mark: this.mark.type.name,
				attrs: this.mark.attrs,
				contentElement: this.contentDOM
			};
		}
		matchesMark(mark) {
			return this.dirty != NODE_DIRTY && this.mark.eq(mark);
		}
		markDirty(from, to) {
			super.markDirty(from, to);
			if (this.dirty != NOT_DIRTY) {
				let parent = this.parent;
				while (!parent.node) parent = parent.parent;
				if (parent.dirty < this.dirty) parent.dirty = this.dirty;
				this.dirty = NOT_DIRTY;
			}
		}
		slice(from, to, view) {
			let copy = MarkViewDesc.create(this.parent, this.mark, true, view);
			let nodes = this.children, size = this.size;
			if (to < size) nodes = replaceNodes(nodes, to, size, view);
			if (from > 0) nodes = replaceNodes(nodes, 0, from, view);
			for (let i = 0; i < nodes.length; i++) nodes[i].parent = copy;
			copy.children = nodes;
			return copy;
		}
		ignoreMutation(mutation) {
			return this.spec.ignoreMutation ? this.spec.ignoreMutation(mutation) : super.ignoreMutation(mutation);
		}
		destroy() {
			if (this.spec.destroy) this.spec.destroy();
			super.destroy();
		}
	};
	var NodeViewDesc = class NodeViewDesc extends ViewDesc {
		constructor(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos) {
			super(parent, [], dom, contentDOM);
			this.node = node;
			this.outerDeco = outerDeco;
			this.innerDeco = innerDeco;
			this.nodeDOM = nodeDOM;
		}
		static create(parent, node, outerDeco, innerDeco, view, pos) {
			let custom = view.nodeViews[node.type.name], descObj;
			let spec = custom && custom(node, view, () => {
				if (!descObj) return pos;
				if (descObj.parent) return descObj.parent.posBeforeChild(descObj);
			}, outerDeco, innerDeco);
			let dom = spec && spec.dom, contentDOM = spec && spec.contentDOM;
			if (node.isText) {
				if (!dom) dom = document.createTextNode(node.text);
				else if (dom.nodeType != 3) throw new RangeError("Text must be rendered as a DOM text node");
			} else if (!dom) {
				let spec = DOMSerializer.renderSpec(document, node.type.spec.toDOM(node), null, node.attrs);
				({dom, contentDOM} = spec);
			}
			if (!contentDOM && !node.isText && dom.nodeName != "BR") {
				if (!dom.hasAttribute("contenteditable")) dom.contentEditable = "false";
				if (node.type.spec.draggable) dom.draggable = true;
			}
			let nodeDOM = dom;
			dom = applyOuterDeco(dom, outerDeco, node);
			if (spec) return descObj = new CustomNodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM || null, nodeDOM, spec, view, pos + 1);
			else if (node.isText) return new TextViewDesc(parent, node, outerDeco, innerDeco, dom, nodeDOM, view);
			else return new NodeViewDesc(parent, node, outerDeco, innerDeco, dom, contentDOM || null, nodeDOM, view, pos + 1);
		}
		parseRule() {
			if (this.node.type.spec.reparseInView) return null;
			let rule = {
				node: this.node.type.name,
				attrs: this.node.attrs
			};
			if (this.node.type.whitespace == "pre") rule.preserveWhitespace = "full";
			if (!this.contentDOM) rule.getContent = () => this.node.content;
			else if (!this.contentLost) rule.contentElement = this.contentDOM;
			else {
				for (let i = this.children.length - 1; i >= 0; i--) {
					let child = this.children[i];
					if (this.dom.contains(child.dom.parentNode)) {
						rule.contentElement = child.dom.parentNode;
						break;
					}
				}
				if (!rule.contentElement) rule.getContent = () => Fragment.empty;
			}
			return rule;
		}
		matchesNode(node, outerDeco, innerDeco) {
			return this.dirty == NOT_DIRTY && node.eq(this.node) && sameOuterDeco(outerDeco, this.outerDeco) && innerDeco.eq(this.innerDeco);
		}
		get size() {
			return this.node.nodeSize;
		}
		get border() {
			return this.node.isLeaf ? 0 : 1;
		}
		updateChildren(view, pos) {
			let inline = this.node.inlineContent, off = pos;
			let composition = view.composing ? this.localCompositionInfo(view, pos) : null;
			let localComposition = composition && composition.pos > -1 ? composition : null;
			let compositionInChild = composition && composition.pos < 0;
			let updater = new ViewTreeUpdater(this, localComposition && localComposition.node, view);
			iterDeco(this.node, this.innerDeco, (widget, i, insideNode) => {
				if (widget.spec.marks) updater.syncToMarks(widget.spec.marks, inline, view, i);
				else if (widget.type.side >= 0 && !insideNode) updater.syncToMarks(i == this.node.childCount ? Mark.none : this.node.child(i).marks, inline, view, i);
				updater.placeWidget(widget, view, off);
			}, (child, outerDeco, innerDeco, i) => {
				updater.syncToMarks(child.marks, inline, view, i);
				let compIndex;
				if (updater.findNodeMatch(child, outerDeco, innerDeco, i));
				else if (compositionInChild && view.state.selection.from > off && view.state.selection.to < off + child.nodeSize && (compIndex = updater.findIndexWithChild(composition.node)) > -1 && updater.updateNodeAt(child, outerDeco, innerDeco, compIndex, view));
				else if (updater.updateNextNode(child, outerDeco, innerDeco, view, i, off));
				else updater.addNode(child, outerDeco, innerDeco, view, off);
				off += child.nodeSize;
			});
			updater.syncToMarks([], inline, view, 0);
			if (this.node.isTextblock) updater.addTextblockHacks();
			updater.destroyRest();
			if (updater.changed || this.dirty == CONTENT_DIRTY) {
				if (localComposition) this.protectLocalComposition(view, localComposition);
				renderDescs(this.contentDOM, this.children, view);
				if (ios) iosHacks(this.dom);
			}
		}
		localCompositionInfo(view, pos) {
			let { from, to } = view.state.selection;
			if (!(view.state.selection instanceof TextSelection) || from < pos || to > pos + this.node.content.size) return null;
			let textNode = view.input.compositionNode;
			if (!textNode || !this.dom.contains(textNode.parentNode)) return null;
			if (this.node.inlineContent) {
				let text = textNode.nodeValue;
				let textPos = findTextInFragment(this.node.content, text, from - pos, to - pos);
				return textPos < 0 ? null : {
					node: textNode,
					pos: textPos,
					text
				};
			} else return {
				node: textNode,
				pos: -1,
				text: ""
			};
		}
		protectLocalComposition(view, { node, pos, text }) {
			if (this.getDesc(node)) return;
			let topNode = node;
			for (;; topNode = topNode.parentNode) {
				if (topNode.parentNode == this.contentDOM) break;
				while (topNode.previousSibling) topNode.parentNode.removeChild(topNode.previousSibling);
				while (topNode.nextSibling) topNode.parentNode.removeChild(topNode.nextSibling);
				if (topNode.pmViewDesc) topNode.pmViewDesc = void 0;
			}
			let desc = new CompositionViewDesc(this, topNode, node, text);
			view.input.compositionNodes.push(desc);
			this.children = replaceNodes(this.children, pos, pos + text.length, view, desc);
		}
		update(node, outerDeco, innerDeco, view) {
			if (this.dirty == NODE_DIRTY || !node.sameMarkup(this.node)) return false;
			this.updateInner(node, outerDeco, innerDeco, view);
			return true;
		}
		updateInner(node, outerDeco, innerDeco, view) {
			this.updateOuterDeco(outerDeco);
			this.node = node;
			this.innerDeco = innerDeco;
			if (this.contentDOM) this.updateChildren(view, this.posAtStart);
			this.dirty = NOT_DIRTY;
		}
		updateOuterDeco(outerDeco) {
			if (sameOuterDeco(outerDeco, this.outerDeco)) return;
			let needsWrap = this.nodeDOM.nodeType != 1;
			let oldDOM = this.dom;
			this.dom = patchOuterDeco(this.dom, this.nodeDOM, computeOuterDeco(this.outerDeco, this.node, needsWrap), computeOuterDeco(outerDeco, this.node, needsWrap));
			if (this.dom != oldDOM) {
				oldDOM.pmViewDesc = void 0;
				this.dom.pmViewDesc = this;
			}
			this.outerDeco = outerDeco;
		}
		selectNode() {
			if (this.nodeDOM.nodeType == 1) {
				this.nodeDOM.classList.add("ProseMirror-selectednode");
				if (this.contentDOM || !this.node.type.spec.draggable) this.nodeDOM.draggable = true;
			}
		}
		deselectNode() {
			if (this.nodeDOM.nodeType == 1) {
				this.nodeDOM.classList.remove("ProseMirror-selectednode");
				if (this.contentDOM || !this.node.type.spec.draggable) this.nodeDOM.removeAttribute("draggable");
			}
		}
		get domAtom() {
			return this.node.isAtom;
		}
	};
	function docViewDesc(doc, outerDeco, innerDeco, dom, view) {
		applyOuterDeco(dom, outerDeco, doc);
		let docView = new NodeViewDesc(void 0, doc, outerDeco, innerDeco, dom, dom, dom, view, 0);
		if (docView.contentDOM) docView.updateChildren(view, 0);
		return docView;
	}
	var TextViewDesc = class TextViewDesc extends NodeViewDesc {
		constructor(parent, node, outerDeco, innerDeco, dom, nodeDOM, view) {
			super(parent, node, outerDeco, innerDeco, dom, null, nodeDOM, view, 0);
		}
		parseRule() {
			let skip = this.nodeDOM.parentNode;
			while (skip && skip != this.dom && !skip.pmIsDeco) skip = skip.parentNode;
			return { skip: skip || true };
		}
		update(node, outerDeco, innerDeco, view) {
			if (this.dirty == NODE_DIRTY || this.dirty != NOT_DIRTY && !this.inParent() || !node.sameMarkup(this.node)) return false;
			this.updateOuterDeco(outerDeco);
			if ((this.dirty != NOT_DIRTY || node.text != this.node.text) && node.text != this.nodeDOM.nodeValue) {
				this.nodeDOM.nodeValue = node.text;
				if (view.trackWrites == this.nodeDOM) view.trackWrites = null;
			}
			this.node = node;
			this.dirty = NOT_DIRTY;
			return true;
		}
		inParent() {
			let parentDOM = this.parent.contentDOM;
			for (let n = this.nodeDOM; n; n = n.parentNode) if (n == parentDOM) return true;
			return false;
		}
		domFromPos(pos) {
			return {
				node: this.nodeDOM,
				offset: pos
			};
		}
		localPosFromDOM(dom, offset, bias) {
			if (dom == this.nodeDOM) return this.posAtStart + Math.min(offset, this.node.text.length);
			return super.localPosFromDOM(dom, offset, bias);
		}
		ignoreMutation(mutation) {
			return mutation.type != "characterData" && mutation.type != "selection";
		}
		slice(from, to, view) {
			let node = this.node.cut(from, to), dom = document.createTextNode(node.text);
			return new TextViewDesc(this.parent, node, this.outerDeco, this.innerDeco, dom, dom, view);
		}
		markDirty(from, to) {
			super.markDirty(from, to);
			if (this.dom != this.nodeDOM && (from == 0 || to == this.nodeDOM.nodeValue.length)) this.dirty = NODE_DIRTY;
		}
		get domAtom() {
			return false;
		}
		isText(text) {
			return this.node.text == text;
		}
	};
	var TrailingHackViewDesc = class extends ViewDesc {
		parseRule() {
			return { ignore: true };
		}
		matchesHack(nodeName) {
			return this.dirty == NOT_DIRTY && this.dom.nodeName == nodeName;
		}
		get domAtom() {
			return true;
		}
		get ignoreForCoords() {
			return this.dom.nodeName == "IMG";
		}
	};
	var CustomNodeViewDesc = class extends NodeViewDesc {
		constructor(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, spec, view, pos) {
			super(parent, node, outerDeco, innerDeco, dom, contentDOM, nodeDOM, view, pos);
			this.spec = spec;
		}
		update(node, outerDeco, innerDeco, view) {
			if (this.dirty == NODE_DIRTY) return false;
			if (this.spec.update && (this.node.type == node.type || this.spec.multiType)) {
				let result = this.spec.update(node, outerDeco, innerDeco);
				if (result) this.updateInner(node, outerDeco, innerDeco, view);
				return result;
			} else if (!this.contentDOM && !node.isLeaf) return false;
			else return super.update(node, outerDeco, innerDeco, view);
		}
		selectNode() {
			this.spec.selectNode ? this.spec.selectNode() : super.selectNode();
		}
		deselectNode() {
			this.spec.deselectNode ? this.spec.deselectNode() : super.deselectNode();
		}
		setSelection(anchor, head, view, force) {
			this.spec.setSelection ? this.spec.setSelection(anchor, head, view.root) : super.setSelection(anchor, head, view, force);
		}
		destroy() {
			if (this.spec.destroy) this.spec.destroy();
			super.destroy();
		}
		stopEvent(event) {
			return this.spec.stopEvent ? this.spec.stopEvent(event) : false;
		}
		ignoreMutation(mutation) {
			return this.spec.ignoreMutation ? this.spec.ignoreMutation(mutation) : super.ignoreMutation(mutation);
		}
	};
	function renderDescs(parentDOM, descs, view) {
		let dom = parentDOM.firstChild, written = false;
		for (let i = 0; i < descs.length; i++) {
			let desc = descs[i], childDOM = desc.dom;
			if (childDOM.parentNode == parentDOM) {
				while (childDOM != dom) {
					dom = rm(dom);
					written = true;
				}
				dom = dom.nextSibling;
			} else {
				written = true;
				parentDOM.insertBefore(childDOM, dom);
			}
			if (desc instanceof MarkViewDesc) {
				let pos = dom ? dom.previousSibling : parentDOM.lastChild;
				renderDescs(desc.contentDOM, desc.children, view);
				dom = pos ? pos.nextSibling : parentDOM.firstChild;
			}
		}
		while (dom) {
			dom = rm(dom);
			written = true;
		}
		if (written && view.trackWrites == parentDOM) view.trackWrites = null;
	}
	var OuterDecoLevel = function(nodeName) {
		if (nodeName) this.nodeName = nodeName;
	};
	OuterDecoLevel.prototype = Object.create(null);
	var noDeco = [new OuterDecoLevel()];
	function computeOuterDeco(outerDeco, node, needsWrap) {
		if (outerDeco.length == 0) return noDeco;
		let top = needsWrap ? noDeco[0] : new OuterDecoLevel(), result = [top];
		for (let i = 0; i < outerDeco.length; i++) {
			let attrs = outerDeco[i].type.attrs;
			if (!attrs) continue;
			if (attrs.nodeName) result.push(top = new OuterDecoLevel(attrs.nodeName));
			for (let name in attrs) {
				let val = attrs[name];
				if (val == null) continue;
				if (needsWrap && result.length == 1) result.push(top = new OuterDecoLevel(node.isInline ? "span" : "div"));
				if (name == "class") top.class = (top.class ? top.class + " " : "") + val;
				else if (name == "style") top.style = (top.style ? top.style + ";" : "") + val;
				else if (name != "nodeName") top[name] = val;
			}
		}
		return result;
	}
	function patchOuterDeco(outerDOM, nodeDOM, prevComputed, curComputed) {
		if (prevComputed == noDeco && curComputed == noDeco) return nodeDOM;
		let curDOM = nodeDOM;
		for (let i = 0; i < curComputed.length; i++) {
			let deco = curComputed[i], prev = prevComputed[i];
			if (i) {
				let parent;
				if (prev && prev.nodeName == deco.nodeName && curDOM != outerDOM && (parent = curDOM.parentNode) && parent.nodeName.toLowerCase() == deco.nodeName) curDOM = parent;
				else {
					parent = document.createElement(deco.nodeName);
					parent.pmIsDeco = true;
					parent.appendChild(curDOM);
					prev = noDeco[0];
					curDOM = parent;
				}
			}
			patchAttributes(curDOM, prev || noDeco[0], deco);
		}
		return curDOM;
	}
	function patchAttributes(dom, prev, cur) {
		for (let name in prev) if (name != "class" && name != "style" && name != "nodeName" && !(name in cur)) dom.removeAttribute(name);
		for (let name in cur) if (name != "class" && name != "style" && name != "nodeName" && cur[name] != prev[name]) dom.setAttribute(name, cur[name]);
		if (prev.class != cur.class) {
			let prevList = prev.class ? prev.class.split(" ").filter(Boolean) : [];
			let curList = cur.class ? cur.class.split(" ").filter(Boolean) : [];
			for (let i = 0; i < prevList.length; i++) if (curList.indexOf(prevList[i]) == -1) dom.classList.remove(prevList[i]);
			for (let i = 0; i < curList.length; i++) if (prevList.indexOf(curList[i]) == -1) dom.classList.add(curList[i]);
			if (dom.classList.length == 0) dom.removeAttribute("class");
		}
		if (prev.style != cur.style) {
			if (prev.style) {
				let prop = /\s*([\w\-\xa1-\uffff]+)\s*:(?:"(?:\\.|[^"])*"|'(?:\\.|[^'])*'|\(.*?\)|[^;])*/g, m;
				while (m = prop.exec(prev.style)) dom.style.removeProperty(m[1]);
			}
			if (cur.style) dom.style.cssText += cur.style;
		}
	}
	function applyOuterDeco(dom, deco, node) {
		return patchOuterDeco(dom, dom, noDeco, computeOuterDeco(deco, node, dom.nodeType != 1));
	}
	function sameOuterDeco(a, b) {
		if (a.length != b.length) return false;
		for (let i = 0; i < a.length; i++) if (!a[i].type.eq(b[i].type)) return false;
		return true;
	}
	function rm(dom) {
		let next = dom.nextSibling;
		dom.parentNode.removeChild(dom);
		return next;
	}
	var ViewTreeUpdater = class {
		constructor(top, lock, view) {
			this.lock = lock;
			this.view = view;
			this.index = 0;
			this.stack = [];
			this.changed = false;
			this.top = top;
			this.preMatch = preMatch(top.node.content, top);
		}
		destroyBetween(start, end) {
			if (start == end) return;
			for (let i = start; i < end; i++) this.top.children[i].destroy();
			this.top.children.splice(start, end - start);
			this.changed = true;
		}
		destroyRest() {
			this.destroyBetween(this.index, this.top.children.length);
		}
		syncToMarks(marks, inline, view, parentIndex) {
			let keep = 0, depth = this.stack.length >> 1;
			let maxKeep = Math.min(depth, marks.length);
			while (keep < maxKeep && (keep == depth - 1 ? this.top : this.stack[keep + 1 << 1]).matchesMark(marks[keep]) && marks[keep].type.spec.spanning !== false) keep++;
			while (keep < depth) {
				this.destroyRest();
				this.top.dirty = NOT_DIRTY;
				this.index = this.stack.pop();
				this.top = this.stack.pop();
				depth--;
			}
			while (depth < marks.length) {
				this.stack.push(this.top, this.index + 1);
				let found = -1, scanTo = this.top.children.length;
				if (parentIndex < this.preMatch.index) scanTo = Math.min(this.index + 3, scanTo);
				for (let i = this.index; i < scanTo; i++) {
					let next = this.top.children[i];
					if (next.matchesMark(marks[depth]) && !this.isLocked(next.dom)) {
						found = i;
						break;
					}
				}
				if (found > -1) {
					if (found > this.index) {
						this.changed = true;
						this.destroyBetween(this.index, found);
					}
					this.top = this.top.children[this.index];
				} else {
					let markDesc = MarkViewDesc.create(this.top, marks[depth], inline, view);
					this.top.children.splice(this.index, 0, markDesc);
					this.top = markDesc;
					this.changed = true;
				}
				this.index = 0;
				depth++;
			}
		}
		findNodeMatch(node, outerDeco, innerDeco, index) {
			let found = -1, targetDesc;
			if (index >= this.preMatch.index && (targetDesc = this.preMatch.matches[index - this.preMatch.index]).parent == this.top && targetDesc.matchesNode(node, outerDeco, innerDeco)) found = this.top.children.indexOf(targetDesc, this.index);
			else for (let i = this.index, e = Math.min(this.top.children.length, i + 5); i < e; i++) {
				let child = this.top.children[i];
				if (child.matchesNode(node, outerDeco, innerDeco) && !this.preMatch.matched.has(child)) {
					found = i;
					break;
				}
			}
			if (found < 0) return false;
			this.destroyBetween(this.index, found);
			this.index++;
			return true;
		}
		updateNodeAt(node, outerDeco, innerDeco, index, view) {
			let child = this.top.children[index];
			if (child.dirty == NODE_DIRTY && child.dom == child.contentDOM) child.dirty = CONTENT_DIRTY;
			if (!child.update(node, outerDeco, innerDeco, view)) return false;
			this.destroyBetween(this.index, index);
			this.index++;
			return true;
		}
		findIndexWithChild(domNode) {
			for (;;) {
				let parent = domNode.parentNode;
				if (!parent) return -1;
				if (parent == this.top.contentDOM) {
					let desc = domNode.pmViewDesc;
					if (desc) {
						for (let i = this.index; i < this.top.children.length; i++) if (this.top.children[i] == desc) return i;
					}
					return -1;
				}
				domNode = parent;
			}
		}
		updateNextNode(node, outerDeco, innerDeco, view, index, pos) {
			for (let i = this.index; i < this.top.children.length; i++) {
				let next = this.top.children[i];
				if (next instanceof NodeViewDesc) {
					let preMatch = this.preMatch.matched.get(next);
					if (preMatch != null && preMatch != index) return false;
					let nextDOM = next.dom, updated;
					let locked = this.isLocked(nextDOM) && !(node.isText && next.node && next.node.isText && next.nodeDOM.nodeValue == node.text && next.dirty != NODE_DIRTY && sameOuterDeco(outerDeco, next.outerDeco));
					if (!locked && next.update(node, outerDeco, innerDeco, view)) {
						this.destroyBetween(this.index, i);
						if (next.dom != nextDOM) this.changed = true;
						this.index++;
						return true;
					} else if (!locked && (updated = this.recreateWrapper(next, node, outerDeco, innerDeco, view, pos))) {
						this.destroyBetween(this.index, i);
						this.top.children[this.index] = updated;
						if (updated.contentDOM) {
							updated.dirty = CONTENT_DIRTY;
							updated.updateChildren(view, pos + 1);
							updated.dirty = NOT_DIRTY;
						}
						this.changed = true;
						this.index++;
						return true;
					}
					break;
				}
			}
			return false;
		}
		recreateWrapper(next, node, outerDeco, innerDeco, view, pos) {
			if (next.dirty || node.isAtom || !next.children.length || !next.node.content.eq(node.content) || !sameOuterDeco(outerDeco, next.outerDeco) || !innerDeco.eq(next.innerDeco)) return null;
			let wrapper = NodeViewDesc.create(this.top, node, outerDeco, innerDeco, view, pos);
			if (wrapper.contentDOM) {
				wrapper.children = next.children;
				next.children = [];
				for (let ch of wrapper.children) ch.parent = wrapper;
			}
			next.destroy();
			return wrapper;
		}
		addNode(node, outerDeco, innerDeco, view, pos) {
			let desc = NodeViewDesc.create(this.top, node, outerDeco, innerDeco, view, pos);
			if (desc.contentDOM) desc.updateChildren(view, pos + 1);
			this.top.children.splice(this.index++, 0, desc);
			this.changed = true;
		}
		placeWidget(widget, view, pos) {
			let next = this.index < this.top.children.length ? this.top.children[this.index] : null;
			if (next && next.matchesWidget(widget) && (widget == next.widget || !next.widget.type.toDOM.parentNode)) this.index++;
			else {
				let desc = new WidgetViewDesc(this.top, widget, view, pos);
				this.top.children.splice(this.index++, 0, desc);
				this.changed = true;
			}
		}
		addTextblockHacks() {
			let lastChild = this.top.children[this.index - 1], parent = this.top;
			while (lastChild instanceof MarkViewDesc) {
				parent = lastChild;
				lastChild = parent.children[parent.children.length - 1];
			}
			if (!lastChild || !(lastChild instanceof TextViewDesc) || /\n$/.test(lastChild.node.text) || this.view.requiresGeckoHackNode && /\s$/.test(lastChild.node.text)) {
				if ((safari || chrome) && lastChild && lastChild.dom.contentEditable == "false") this.addHackNode("IMG", parent);
				this.addHackNode("BR", this.top);
			}
		}
		addHackNode(nodeName, parent) {
			if (parent == this.top && this.index < parent.children.length && parent.children[this.index].matchesHack(nodeName)) this.index++;
			else {
				let dom = document.createElement(nodeName);
				if (nodeName == "IMG") {
					dom.className = "ProseMirror-separator";
					dom.alt = "";
				}
				if (nodeName == "BR") dom.className = "ProseMirror-trailingBreak";
				let hack = new TrailingHackViewDesc(this.top, [], dom, null);
				if (parent != this.top) parent.children.push(hack);
				else parent.children.splice(this.index++, 0, hack);
				this.changed = true;
			}
		}
		isLocked(node) {
			return this.lock && (node == this.lock || node.nodeType == 1 && node.contains(this.lock.parentNode));
		}
	};
	function preMatch(frag, parentDesc) {
		let curDesc = parentDesc, descI = curDesc.children.length;
		let fI = frag.childCount, matched = /* @__PURE__ */ new Map(), matches = [];
		outer: while (fI > 0) {
			let desc;
			for (;;) if (descI) {
				let next = curDesc.children[descI - 1];
				if (next instanceof MarkViewDesc) {
					curDesc = next;
					descI = next.children.length;
				} else {
					desc = next;
					descI--;
					break;
				}
			} else if (curDesc == parentDesc) break outer;
			else {
				descI = curDesc.parent.children.indexOf(curDesc);
				curDesc = curDesc.parent;
			}
			let node = desc.node;
			if (!node) continue;
			if (node != frag.child(fI - 1)) break;
			--fI;
			matched.set(desc, fI);
			matches.push(desc);
		}
		return {
			index: fI,
			matched,
			matches: matches.reverse()
		};
	}
	function compareSide(a, b) {
		return a.type.side - b.type.side;
	}
	function iterDeco(parent, deco, onWidget, onNode) {
		let locals = deco.locals(parent), offset = 0;
		if (locals.length == 0) {
			for (let i = 0; i < parent.childCount; i++) {
				let child = parent.child(i);
				onNode(child, locals, deco.forChild(offset, child), i);
				offset += child.nodeSize;
			}
			return;
		}
		let decoIndex = 0, active = [], restNode = null;
		for (let parentIndex = 0;;) {
			let widget, widgets;
			while (decoIndex < locals.length && locals[decoIndex].to == offset) {
				let next = locals[decoIndex++];
				if (next.widget) if (!widget) widget = next;
				else (widgets || (widgets = [widget])).push(next);
			}
			if (widget) if (widgets) {
				widgets.sort(compareSide);
				for (let i = 0; i < widgets.length; i++) onWidget(widgets[i], parentIndex, !!restNode);
			} else onWidget(widget, parentIndex, !!restNode);
			let child, index;
			if (restNode) {
				index = -1;
				child = restNode;
				restNode = null;
			} else if (parentIndex < parent.childCount) {
				index = parentIndex;
				child = parent.child(parentIndex++);
			} else break;
			for (let i = 0; i < active.length; i++) if (active[i].to <= offset) active.splice(i--, 1);
			while (decoIndex < locals.length && locals[decoIndex].from <= offset && locals[decoIndex].to > offset) active.push(locals[decoIndex++]);
			let end = offset + child.nodeSize;
			if (child.isText) {
				let cutAt = end;
				if (decoIndex < locals.length && locals[decoIndex].from < cutAt) cutAt = locals[decoIndex].from;
				for (let i = 0; i < active.length; i++) if (active[i].to < cutAt) cutAt = active[i].to;
				if (cutAt < end) {
					restNode = child.cut(cutAt - offset);
					child = child.cut(0, cutAt - offset);
					end = cutAt;
					index = -1;
				}
			} else while (decoIndex < locals.length && locals[decoIndex].to < end) decoIndex++;
			let outerDeco = child.isInline && !child.isLeaf ? active.filter((d) => !d.inline) : active.slice();
			onNode(child, outerDeco, deco.forChild(offset, child), index);
			offset = end;
		}
	}
	function iosHacks(dom) {
		if (dom.nodeName == "UL" || dom.nodeName == "OL") {
			let oldCSS = dom.style.cssText;
			dom.style.cssText = oldCSS + "; list-style: square !important";
			window.getComputedStyle(dom).listStyle;
			dom.style.cssText = oldCSS;
		}
	}
	function findTextInFragment(frag, text, from, to) {
		for (let i = 0, pos = 0; i < frag.childCount && pos <= to;) {
			let child = frag.child(i++), childStart = pos;
			pos += child.nodeSize;
			if (!child.isText) continue;
			let str = child.text;
			while (i < frag.childCount) {
				let next = frag.child(i++);
				pos += next.nodeSize;
				if (!next.isText) break;
				str += next.text;
			}
			if (pos >= from) {
				if (pos >= to && str.slice(to - text.length - childStart, to - childStart) == text) return to - text.length;
				let found = childStart < to ? str.lastIndexOf(text, to - childStart - 1) : -1;
				if (found >= 0 && found + text.length + childStart >= from) return childStart + found;
				if (from == to && str.length >= to + text.length - childStart && str.slice(to - childStart, to - childStart + text.length) == text) return to;
			}
		}
		return -1;
	}
	function replaceNodes(nodes, from, to, view, replacement) {
		let result = [];
		for (let i = 0, off = 0; i < nodes.length; i++) {
			let child = nodes[i], start = off, end = off += child.size;
			if (start >= to || end <= from) result.push(child);
			else {
				if (start < from) result.push(child.slice(0, from - start, view));
				if (replacement) {
					result.push(replacement);
					replacement = void 0;
				}
				if (end > to) result.push(child.slice(to - start, child.size, view));
			}
		}
		return result;
	}
	function selectionFromDOM(view, origin = null) {
		let domSel = view.domSelectionRange(), doc = view.state.doc;
		if (!domSel.focusNode) return null;
		let nearestDesc = view.docView.nearestDesc(domSel.focusNode), inWidget = nearestDesc && nearestDesc.size == 0;
		let head = view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset, 1);
		if (head < 0) return null;
		let $head = doc.resolve(head), anchor, selection;
		if (selectionCollapsed(domSel)) {
			anchor = head;
			while (nearestDesc && !nearestDesc.node) nearestDesc = nearestDesc.parent;
			let nearestDescNode = nearestDesc.node;
			if (nearestDesc && nearestDescNode.isAtom && NodeSelection.isSelectable(nearestDescNode) && nearestDesc.parent && !(nearestDescNode.isInline && isOnEdge(domSel.focusNode, domSel.focusOffset, nearestDesc.dom))) {
				let pos = nearestDesc.posBefore;
				selection = new NodeSelection(head == pos ? $head : doc.resolve(pos));
			}
		} else {
			if (domSel instanceof view.dom.ownerDocument.defaultView.Selection && domSel.rangeCount > 1) {
				let min = head, max = head;
				for (let i = 0; i < domSel.rangeCount; i++) {
					let range = domSel.getRangeAt(i);
					min = Math.min(min, view.docView.posFromDOM(range.startContainer, range.startOffset, 1));
					max = Math.max(max, view.docView.posFromDOM(range.endContainer, range.endOffset, -1));
				}
				if (min < 0) return null;
				[anchor, head] = max == view.state.selection.anchor ? [max, min] : [min, max];
				$head = doc.resolve(head);
			} else anchor = view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset, 1);
			if (anchor < 0) return null;
		}
		let $anchor = doc.resolve(anchor);
		if (!selection) {
			let bias = origin == "pointer" || view.state.selection.head < $head.pos && !inWidget ? 1 : -1;
			selection = selectionBetween(view, $anchor, $head, bias);
		}
		return selection;
	}
	function editorOwnsSelection(view) {
		return view.editable ? view.hasFocus() : hasSelection(view) && document.activeElement && document.activeElement.contains(view.dom);
	}
	function selectionToDOM(view, force = false) {
		let sel = view.state.selection;
		syncNodeSelection(view, sel);
		if (!editorOwnsSelection(view)) return;
		if (!force && view.input.mouseDown && view.input.mouseDown.allowDefault && chrome) {
			let domSel = view.domSelectionRange(), curSel = view.domObserver.currentSelection;
			if (domSel.anchorNode && curSel.anchorNode && isEquivalentPosition(domSel.anchorNode, domSel.anchorOffset, curSel.anchorNode, curSel.anchorOffset)) {
				view.input.mouseDown.delayedSelectionSync = true;
				view.domObserver.setCurSelection();
				return;
			}
		}
		view.domObserver.disconnectSelection();
		if (view.cursorWrapper) selectCursorWrapper(view);
		else {
			let { anchor, head } = sel, resetEditableFrom, resetEditableTo;
			if (brokenSelectBetweenUneditable && !(sel instanceof TextSelection)) {
				if (!sel.$from.parent.inlineContent) resetEditableFrom = temporarilyEditableNear(view, sel.from);
				if (!sel.empty && !sel.$from.parent.inlineContent) resetEditableTo = temporarilyEditableNear(view, sel.to);
			}
			view.docView.setSelection(anchor, head, view, force);
			if (brokenSelectBetweenUneditable) {
				if (resetEditableFrom) resetEditable(resetEditableFrom);
				if (resetEditableTo) resetEditable(resetEditableTo);
			}
			if (sel.visible) view.dom.classList.remove("ProseMirror-hideselection");
			else {
				view.dom.classList.add("ProseMirror-hideselection");
				if ("onselectionchange" in document) removeClassOnSelectionChange(view);
			}
		}
		view.domObserver.setCurSelection();
		view.domObserver.connectSelection();
	}
	var brokenSelectBetweenUneditable = safari || chrome && chrome_version < 63;
	function temporarilyEditableNear(view, pos) {
		let { node, offset } = view.docView.domFromPos(pos, 0);
		let after = offset < node.childNodes.length ? node.childNodes[offset] : null;
		let before = offset ? node.childNodes[offset - 1] : null;
		if (safari && after && after.contentEditable == "false") return setEditable(after);
		if ((!after || after.contentEditable == "false") && (!before || before.contentEditable == "false")) {
			if (after) return setEditable(after);
			else if (before) return setEditable(before);
		}
	}
	function setEditable(element) {
		element.contentEditable = "true";
		if (safari && element.draggable) {
			element.draggable = false;
			element.wasDraggable = true;
		}
		return element;
	}
	function resetEditable(element) {
		element.contentEditable = "false";
		if (element.wasDraggable) {
			element.draggable = true;
			element.wasDraggable = null;
		}
	}
	function removeClassOnSelectionChange(view) {
		let doc = view.dom.ownerDocument;
		doc.removeEventListener("selectionchange", view.input.hideSelectionGuard);
		let domSel = view.domSelectionRange();
		let node = domSel.anchorNode, offset = domSel.anchorOffset;
		doc.addEventListener("selectionchange", view.input.hideSelectionGuard = () => {
			if (domSel.anchorNode != node || domSel.anchorOffset != offset) {
				doc.removeEventListener("selectionchange", view.input.hideSelectionGuard);
				setTimeout(() => {
					if (!editorOwnsSelection(view) || view.state.selection.visible) view.dom.classList.remove("ProseMirror-hideselection");
				}, 20);
			}
		});
	}
	function selectCursorWrapper(view) {
		let domSel = view.domSelection();
		if (!domSel) return;
		let node = view.cursorWrapper.dom, img = node.nodeName == "IMG";
		if (img) domSel.collapse(node.parentNode, domIndex(node) + 1);
		else domSel.collapse(node, 0);
		if (!img && !view.state.selection.visible && ie$1 && ie_version <= 11) {
			node.disabled = true;
			node.disabled = false;
		}
	}
	function syncNodeSelection(view, sel) {
		if (sel instanceof NodeSelection) {
			let desc = view.docView.descAt(sel.from);
			if (desc != view.lastSelectedViewDesc) {
				clearNodeSelection(view);
				if (desc) desc.selectNode();
				view.lastSelectedViewDesc = desc;
			}
		} else clearNodeSelection(view);
	}
	function clearNodeSelection(view) {
		if (view.lastSelectedViewDesc) {
			if (view.lastSelectedViewDesc.parent) view.lastSelectedViewDesc.deselectNode();
			view.lastSelectedViewDesc = void 0;
		}
	}
	function selectionBetween(view, $anchor, $head, bias) {
		return view.someProp("createSelectionBetween", (f) => f(view, $anchor, $head)) || TextSelection.between($anchor, $head, bias);
	}
	function hasFocusAndSelection(view) {
		if (view.editable && !view.hasFocus()) return false;
		return hasSelection(view);
	}
	function hasSelection(view) {
		let sel = view.domSelectionRange();
		if (!sel.anchorNode) return false;
		try {
			return view.dom.contains(sel.anchorNode.nodeType == 3 ? sel.anchorNode.parentNode : sel.anchorNode) && (view.editable || view.dom.contains(sel.focusNode.nodeType == 3 ? sel.focusNode.parentNode : sel.focusNode));
		} catch (_) {
			return false;
		}
	}
	function anchorInRightPlace(view) {
		let anchorDOM = view.docView.domFromPos(view.state.selection.anchor, 0);
		let domSel = view.domSelectionRange();
		return isEquivalentPosition(anchorDOM.node, anchorDOM.offset, domSel.anchorNode, domSel.anchorOffset);
	}
	function moveSelectionBlock(state, dir) {
		let { $anchor, $head } = state.selection;
		let $side = dir > 0 ? $anchor.max($head) : $anchor.min($head);
		let $start = !$side.parent.inlineContent ? $side : $side.depth ? state.doc.resolve(dir > 0 ? $side.after() : $side.before()) : null;
		return $start && Selection.findFrom($start, dir);
	}
	function apply(view, sel) {
		view.dispatch(view.state.tr.setSelection(sel).scrollIntoView());
		return true;
	}
	function selectHorizontally(view, dir, mods) {
		let sel = view.state.selection;
		if (sel instanceof TextSelection) {
			if (mods.indexOf("s") > -1) {
				let { $head } = sel, node = $head.textOffset ? null : dir < 0 ? $head.nodeBefore : $head.nodeAfter;
				if (!node || node.isText || !node.isLeaf) return false;
				let $newHead = view.state.doc.resolve($head.pos + node.nodeSize * (dir < 0 ? -1 : 1));
				return apply(view, new TextSelection(sel.$anchor, $newHead));
			} else if (!sel.empty) return false;
			else if (view.endOfTextblock(dir > 0 ? "forward" : "backward")) {
				let next = moveSelectionBlock(view.state, dir);
				if (next && next instanceof NodeSelection) return apply(view, next);
				return false;
			} else if (!(mac$2 && mods.indexOf("m") > -1)) {
				let $head = sel.$head, node = $head.textOffset ? null : dir < 0 ? $head.nodeBefore : $head.nodeAfter, desc;
				if (!node || node.isText) return false;
				let nodePos = dir < 0 ? $head.pos - node.nodeSize : $head.pos;
				if (!(node.isAtom || (desc = view.docView.descAt(nodePos)) && !desc.contentDOM)) return false;
				if (NodeSelection.isSelectable(node)) return apply(view, new NodeSelection(dir < 0 ? view.state.doc.resolve($head.pos - node.nodeSize) : $head));
				else if (webkit) return apply(view, new TextSelection(view.state.doc.resolve(dir < 0 ? nodePos : nodePos + node.nodeSize)));
				else return false;
			}
		} else if (sel instanceof NodeSelection && sel.node.isInline) return apply(view, new TextSelection(dir > 0 ? sel.$to : sel.$from));
		else {
			let next = moveSelectionBlock(view.state, dir);
			if (next) return apply(view, next);
			return false;
		}
	}
	function nodeLen(node) {
		return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
	}
	function isIgnorable(dom, dir) {
		let desc = dom.pmViewDesc;
		return desc && desc.size == 0 && (dir < 0 || dom.nextSibling || dom.nodeName != "BR");
	}
	function skipIgnoredNodes(view, dir) {
		return dir < 0 ? skipIgnoredNodesBefore(view) : skipIgnoredNodesAfter(view);
	}
	function skipIgnoredNodesBefore(view) {
		let sel = view.domSelectionRange();
		let node = sel.focusNode, offset = sel.focusOffset;
		if (!node) return;
		let moveNode, moveOffset, force = false;
		if (gecko && node.nodeType == 1 && offset < nodeLen(node) && isIgnorable(node.childNodes[offset], -1)) force = true;
		for (;;) if (offset > 0) if (node.nodeType != 1) break;
		else {
			let before = node.childNodes[offset - 1];
			if (isIgnorable(before, -1)) {
				moveNode = node;
				moveOffset = --offset;
			} else if (before.nodeType == 3) {
				node = before;
				offset = node.nodeValue.length;
			} else break;
		}
		else if (isBlockNode(node)) break;
		else {
			let prev = node.previousSibling;
			while (prev && isIgnorable(prev, -1)) {
				moveNode = node.parentNode;
				moveOffset = domIndex(prev);
				prev = prev.previousSibling;
			}
			if (!prev) {
				node = node.parentNode;
				if (node == view.dom) break;
				offset = 0;
			} else {
				node = prev;
				offset = nodeLen(node);
			}
		}
		if (force) setSelFocus(view, node, offset);
		else if (moveNode) setSelFocus(view, moveNode, moveOffset);
	}
	function skipIgnoredNodesAfter(view) {
		let sel = view.domSelectionRange();
		let node = sel.focusNode, offset = sel.focusOffset;
		if (!node) return;
		let len = nodeLen(node);
		let moveNode, moveOffset;
		for (;;) if (offset < len) {
			if (node.nodeType != 1) break;
			let after = node.childNodes[offset];
			if (isIgnorable(after, 1)) {
				moveNode = node;
				moveOffset = ++offset;
			} else break;
		} else if (isBlockNode(node)) break;
		else {
			let next = node.nextSibling;
			while (next && isIgnorable(next, 1)) {
				moveNode = next.parentNode;
				moveOffset = domIndex(next) + 1;
				next = next.nextSibling;
			}
			if (!next) {
				node = node.parentNode;
				if (node == view.dom) break;
				offset = len = 0;
			} else {
				node = next;
				offset = 0;
				len = nodeLen(node);
			}
		}
		if (moveNode) setSelFocus(view, moveNode, moveOffset);
	}
	function isBlockNode(dom) {
		let desc = dom.pmViewDesc;
		return desc && desc.node && desc.node.isBlock;
	}
	function textNodeAfter(node, offset) {
		while (node && offset == node.childNodes.length && !hasBlockDesc(node)) {
			offset = domIndex(node) + 1;
			node = node.parentNode;
		}
		while (node && offset < node.childNodes.length) {
			let next = node.childNodes[offset];
			if (next.nodeType == 3) return next;
			if (next.nodeType == 1 && next.contentEditable == "false") break;
			node = next;
			offset = 0;
		}
	}
	function textNodeBefore(node, offset) {
		while (node && !offset && !hasBlockDesc(node)) {
			offset = domIndex(node);
			node = node.parentNode;
		}
		while (node && offset) {
			let next = node.childNodes[offset - 1];
			if (next.nodeType == 3) return next;
			if (next.nodeType == 1 && next.contentEditable == "false") break;
			node = next;
			offset = node.childNodes.length;
		}
	}
	function setSelFocus(view, node, offset) {
		if (node.nodeType != 3) {
			let before, after;
			if (after = textNodeAfter(node, offset)) {
				node = after;
				offset = 0;
			} else if (before = textNodeBefore(node, offset)) {
				node = before;
				offset = before.nodeValue.length;
			}
		}
		let sel = view.domSelection();
		if (!sel) return;
		if (selectionCollapsed(sel)) {
			let range = document.createRange();
			range.setEnd(node, offset);
			range.setStart(node, offset);
			sel.removeAllRanges();
			sel.addRange(range);
		} else if (sel.extend) sel.extend(node, offset);
		view.domObserver.setCurSelection();
		let { state } = view;
		setTimeout(() => {
			if (view.state == state) selectionToDOM(view);
		}, 50);
	}
	function findDirection(view, pos) {
		let $pos = view.state.doc.resolve(pos);
		if (!(chrome || windows$1) && $pos.parent.inlineContent) {
			let coords = view.coordsAtPos(pos);
			if (pos > $pos.start()) {
				let before = view.coordsAtPos(pos - 1);
				let mid = (before.top + before.bottom) / 2;
				if (mid > coords.top && mid < coords.bottom && Math.abs(before.left - coords.left) > 1) return before.left < coords.left ? "ltr" : "rtl";
			}
			if (pos < $pos.end()) {
				let after = view.coordsAtPos(pos + 1);
				let mid = (after.top + after.bottom) / 2;
				if (mid > coords.top && mid < coords.bottom && Math.abs(after.left - coords.left) > 1) return after.left > coords.left ? "ltr" : "rtl";
			}
		}
		return getComputedStyle(view.dom).direction == "rtl" ? "rtl" : "ltr";
	}
	function selectVertically(view, dir, mods) {
		let sel = view.state.selection;
		if (sel instanceof TextSelection && !sel.empty || mods.indexOf("s") > -1) return false;
		if (mac$2 && mods.indexOf("m") > -1) return false;
		let { $from, $to } = sel;
		if (!$from.parent.inlineContent || view.endOfTextblock(dir < 0 ? "up" : "down")) {
			let next = moveSelectionBlock(view.state, dir);
			if (next && next instanceof NodeSelection) return apply(view, next);
		}
		if (!$from.parent.inlineContent) {
			let side = dir < 0 ? $from : $to;
			let beyond = sel instanceof AllSelection ? Selection.near(side, dir) : Selection.findFrom(side, dir);
			return beyond ? apply(view, beyond) : false;
		}
		return false;
	}
	function stopNativeHorizontalDelete(view, dir) {
		if (!(view.state.selection instanceof TextSelection)) return true;
		let { $head, $anchor, empty } = view.state.selection;
		if (!$head.sameParent($anchor)) return true;
		if (!empty) return false;
		if (view.endOfTextblock(dir > 0 ? "forward" : "backward")) return true;
		let nextNode = !$head.textOffset && (dir < 0 ? $head.nodeBefore : $head.nodeAfter);
		if (nextNode && !nextNode.isText) {
			let tr = view.state.tr;
			if (dir < 0) tr.delete($head.pos - nextNode.nodeSize, $head.pos);
			else tr.delete($head.pos, $head.pos + nextNode.nodeSize);
			view.dispatch(tr);
			return true;
		}
		return false;
	}
	function switchEditable(view, node, state) {
		view.domObserver.stop();
		node.contentEditable = state;
		view.domObserver.start();
	}
	function safariDownArrowBug(view) {
		if (!safari || view.state.selection.$head.parentOffset > 0) return false;
		let { focusNode, focusOffset } = view.domSelectionRange();
		if (focusNode && focusNode.nodeType == 1 && focusOffset == 0 && focusNode.firstChild && focusNode.firstChild.contentEditable == "false") {
			let child = focusNode.firstChild;
			switchEditable(view, child, "true");
			setTimeout(() => switchEditable(view, child, "false"), 20);
		}
		return false;
	}
	function getMods(event) {
		let result = "";
		if (event.ctrlKey) result += "c";
		if (event.metaKey) result += "m";
		if (event.altKey) result += "a";
		if (event.shiftKey) result += "s";
		return result;
	}
	function captureKeyDown(view, event) {
		let code = event.keyCode, mods = getMods(event);
		if (code == 8 || mac$2 && code == 72 && mods == "c") return stopNativeHorizontalDelete(view, -1) || skipIgnoredNodes(view, -1);
		else if (code == 46 && !event.shiftKey || mac$2 && code == 68 && mods == "c") return stopNativeHorizontalDelete(view, 1) || skipIgnoredNodes(view, 1);
		else if (code == 13 || code == 27) return true;
		else if (code == 37 || mac$2 && code == 66 && mods == "c") {
			let dir = code == 37 ? findDirection(view, view.state.selection.from) == "ltr" ? -1 : 1 : -1;
			return selectHorizontally(view, dir, mods) || skipIgnoredNodes(view, dir);
		} else if (code == 39 || mac$2 && code == 70 && mods == "c") {
			let dir = code == 39 ? findDirection(view, view.state.selection.from) == "ltr" ? 1 : -1 : 1;
			return selectHorizontally(view, dir, mods) || skipIgnoredNodes(view, dir);
		} else if (code == 38 || mac$2 && code == 80 && mods == "c") return selectVertically(view, -1, mods) || skipIgnoredNodes(view, -1);
		else if (code == 40 || mac$2 && code == 78 && mods == "c") return safariDownArrowBug(view) || selectVertically(view, 1, mods) || skipIgnoredNodes(view, 1);
		else if (mods == (mac$2 ? "m" : "c") && (code == 66 || code == 73 || code == 89 || code == 90)) return true;
		return false;
	}
	function serializeForClipboard(view, slice) {
		view.someProp("transformCopied", (f) => {
			slice = f(slice, view);
		});
		let context = [], { content, openStart, openEnd } = slice;
		while (openStart > 1 && openEnd > 1 && content.childCount == 1 && content.firstChild.childCount == 1) {
			openStart--;
			openEnd--;
			let node = content.firstChild;
			context.push(node.type.name, node.attrs != node.type.defaultAttrs ? node.attrs : null);
			content = node.content;
		}
		let serializer = view.someProp("clipboardSerializer") || DOMSerializer.fromSchema(view.state.schema);
		let doc = detachedDoc(), wrap = doc.createElement("div");
		wrap.appendChild(serializer.serializeFragment(content, { document: doc }));
		let firstChild = wrap.firstChild, needsWrap, wrappers = 0;
		while (firstChild && firstChild.nodeType == 1 && (needsWrap = wrapMap[firstChild.nodeName.toLowerCase()])) {
			for (let i = needsWrap.length - 1; i >= 0; i--) {
				let wrapper = doc.createElement(needsWrap[i]);
				while (wrap.firstChild) wrapper.appendChild(wrap.firstChild);
				wrap.appendChild(wrapper);
				wrappers++;
			}
			firstChild = wrap.firstChild;
		}
		if (firstChild && firstChild.nodeType == 1) firstChild.setAttribute("data-pm-slice", `${openStart} ${openEnd}${wrappers ? ` -${wrappers}` : ""} ${JSON.stringify(context)}`);
		return {
			dom: wrap,
			text: view.someProp("clipboardTextSerializer", (f) => f(slice, view)) || slice.content.textBetween(0, slice.content.size, "\n\n"),
			slice
		};
	}
	function parseFromClipboard(view, text, html, plainText, $context) {
		let inCode = $context.parent.type.spec.code;
		let dom, slice;
		if (!html && !text) return null;
		let asText = !!text && (plainText || inCode || !html);
		if (asText) {
			view.someProp("transformPastedText", (f) => {
				text = f(text, inCode || plainText, view);
			});
			if (inCode) {
				slice = new Slice(Fragment.from(view.state.schema.text(text.replace(/\r\n?/g, "\n"))), 0, 0);
				view.someProp("transformPasted", (f) => {
					slice = f(slice, view, true);
				});
				return slice;
			}
			let parsed = view.someProp("clipboardTextParser", (f) => f(text, $context, plainText, view));
			if (parsed) slice = parsed;
			else {
				let marks = $context.marks();
				let { schema } = view.state, serializer = DOMSerializer.fromSchema(schema);
				dom = document.createElement("div");
				text.split(/(?:\r\n?|\n)+/).forEach((block) => {
					let p = dom.appendChild(document.createElement("p"));
					if (block) p.appendChild(serializer.serializeNode(schema.text(block, marks)));
				});
			}
		} else {
			view.someProp("transformPastedHTML", (f) => {
				html = f(html, view);
			});
			dom = readHTML(html);
			if (webkit) restoreReplacedSpaces(dom);
		}
		let contextNode = dom && dom.querySelector("[data-pm-slice]");
		let sliceData = contextNode && /^(\d+) (\d+)(?: -(\d+))? (.*)/.exec(contextNode.getAttribute("data-pm-slice") || "");
		if (sliceData && sliceData[3]) for (let i = +sliceData[3]; i > 0; i--) {
			let child = dom.firstChild;
			while (child && child.nodeType != 1) child = child.nextSibling;
			if (!child) break;
			dom = child;
		}
		if (!slice) slice = (view.someProp("clipboardParser") || view.someProp("domParser") || DOMParser.fromSchema(view.state.schema)).parseSlice(dom, {
			preserveWhitespace: !!(asText || sliceData),
			context: $context,
			ruleFromNode(dom) {
				if (dom.nodeName == "BR" && !dom.nextSibling && dom.parentNode && !inlineParents.test(dom.parentNode.nodeName)) return { ignore: true };
				return null;
			}
		});
		if (sliceData) slice = addContext(closeSlice(slice, +sliceData[1], +sliceData[2]), sliceData[4]);
		else {
			slice = Slice.maxOpen(normalizeSiblings(slice.content, $context), true);
			if (slice.openStart || slice.openEnd) {
				let openStart = 0, openEnd = 0;
				for (let node = slice.content.firstChild; openStart < slice.openStart && !node.type.spec.isolating; openStart++, node = node.firstChild);
				for (let node = slice.content.lastChild; openEnd < slice.openEnd && !node.type.spec.isolating; openEnd++, node = node.lastChild);
				slice = closeSlice(slice, openStart, openEnd);
			}
		}
		view.someProp("transformPasted", (f) => {
			slice = f(slice, view, asText);
		});
		return slice;
	}
	var inlineParents = /^(a|abbr|acronym|b|cite|code|del|em|i|ins|kbd|label|output|q|ruby|s|samp|span|strong|sub|sup|time|u|tt|var)$/i;
	function normalizeSiblings(fragment, $context) {
		if (fragment.childCount < 2) return fragment;
		for (let d = $context.depth; d >= 0; d--) {
			let match = $context.node(d).contentMatchAt($context.index(d));
			let lastWrap, result = [];
			fragment.forEach((node) => {
				if (!result) return;
				let wrap = match.findWrapping(node.type), inLast;
				if (!wrap) return result = null;
				if (inLast = result.length && lastWrap.length && addToSibling(wrap, lastWrap, node, result[result.length - 1], 0)) result[result.length - 1] = inLast;
				else {
					if (result.length) result[result.length - 1] = closeRight(result[result.length - 1], lastWrap.length);
					let wrapped = withWrappers(node, wrap);
					result.push(wrapped);
					match = match.matchType(wrapped.type);
					lastWrap = wrap;
				}
			});
			if (result) return Fragment.from(result);
		}
		return fragment;
	}
	function withWrappers(node, wrap, from = 0) {
		for (let i = wrap.length - 1; i >= from; i--) node = wrap[i].create(null, Fragment.from(node));
		return node;
	}
	function addToSibling(wrap, lastWrap, node, sibling, depth) {
		if (depth < wrap.length && depth < lastWrap.length && wrap[depth] == lastWrap[depth]) {
			let inner = addToSibling(wrap, lastWrap, node, sibling.lastChild, depth + 1);
			if (inner) return sibling.copy(sibling.content.replaceChild(sibling.childCount - 1, inner));
			if (sibling.contentMatchAt(sibling.childCount).matchType(depth == wrap.length - 1 ? node.type : wrap[depth + 1])) return sibling.copy(sibling.content.append(Fragment.from(withWrappers(node, wrap, depth + 1))));
		}
	}
	function closeRight(node, depth) {
		if (depth == 0) return node;
		let fragment = node.content.replaceChild(node.childCount - 1, closeRight(node.lastChild, depth - 1));
		let fill = node.contentMatchAt(node.childCount).fillBefore(Fragment.empty, true);
		return node.copy(fragment.append(fill));
	}
	function closeRange(fragment, side, from, to, depth, openEnd) {
		let node = side < 0 ? fragment.firstChild : fragment.lastChild, inner = node.content;
		if (fragment.childCount > 1) openEnd = 0;
		if (depth < to - 1) inner = closeRange(inner, side, from, to, depth + 1, openEnd);
		if (depth >= from) inner = side < 0 ? node.contentMatchAt(0).fillBefore(inner, openEnd <= depth).append(inner) : inner.append(node.contentMatchAt(node.childCount).fillBefore(Fragment.empty, true));
		return fragment.replaceChild(side < 0 ? 0 : fragment.childCount - 1, node.copy(inner));
	}
	function closeSlice(slice, openStart, openEnd) {
		if (openStart < slice.openStart) slice = new Slice(closeRange(slice.content, -1, openStart, slice.openStart, 0, slice.openEnd), openStart, slice.openEnd);
		if (openEnd < slice.openEnd) slice = new Slice(closeRange(slice.content, 1, openEnd, slice.openEnd, 0, 0), slice.openStart, openEnd);
		return slice;
	}
	var wrapMap = {
		thead: ["table"],
		tbody: ["table"],
		tfoot: ["table"],
		caption: ["table"],
		colgroup: ["table"],
		col: ["table", "colgroup"],
		tr: ["table", "tbody"],
		td: [
			"table",
			"tbody",
			"tr"
		],
		th: [
			"table",
			"tbody",
			"tr"
		]
	};
	var _detachedDoc = null;
	function detachedDoc() {
		return _detachedDoc || (_detachedDoc = document.implementation.createHTMLDocument("title"));
	}
	var _policy = null;
	function maybeWrapTrusted(html) {
		let trustedTypes = window.trustedTypes;
		if (!trustedTypes) return html;
		if (!_policy) _policy = trustedTypes.defaultPolicy || trustedTypes.createPolicy("ProseMirrorClipboard", { createHTML: (s) => s });
		return _policy.createHTML(html);
	}
	function readHTML(html) {
		let metas = /^(\s*<meta [^>]*>)*/.exec(html);
		if (metas) html = html.slice(metas[0].length);
		let elt = detachedDoc().createElement("div");
		let firstTag = /<([a-z][^>\s]+)/i.exec(html), wrap;
		if (wrap = firstTag && wrapMap[firstTag[1].toLowerCase()]) html = wrap.map((n) => "<" + n + ">").join("") + html + wrap.map((n) => "</" + n + ">").reverse().join("");
		elt.innerHTML = maybeWrapTrusted(html);
		if (wrap) for (let i = 0; i < wrap.length; i++) elt = elt.querySelector(wrap[i]) || elt;
		return elt;
	}
	function restoreReplacedSpaces(dom) {
		let nodes = dom.querySelectorAll(chrome ? "span:not([class]):not([style])" : "span.Apple-converted-space");
		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			if (node.childNodes.length == 1 && node.textContent == "\xA0" && node.parentNode) node.parentNode.replaceChild(dom.ownerDocument.createTextNode(" "), node);
		}
	}
	function addContext(slice, context) {
		if (!slice.size) return slice;
		let schema = slice.content.firstChild.type.schema, array;
		try {
			array = JSON.parse(context);
		} catch (e) {
			return slice;
		}
		let { content, openStart, openEnd } = slice;
		for (let i = array.length - 2; i >= 0; i -= 2) {
			let type = schema.nodes[array[i]];
			if (!type || type.hasRequiredAttrs()) break;
			content = Fragment.from(type.create(array[i + 1], content));
			openStart++;
			openEnd++;
		}
		return new Slice(content, openStart, openEnd);
	}
	var handlers = {};
	var editHandlers = {};
	var passiveHandlers = {
		touchstart: true,
		touchmove: true
	};
	var InputState = class {
		constructor() {
			this.shiftKey = false;
			this.mouseDown = null;
			this.lastKeyCode = null;
			this.lastKeyCodeTime = 0;
			this.lastClick = {
				time: 0,
				x: 0,
				y: 0,
				type: "",
				button: 0
			};
			this.lastSelectionOrigin = null;
			this.lastSelectionTime = 0;
			this.lastIOSEnter = 0;
			this.lastIOSEnterFallbackTimeout = -1;
			this.lastFocus = 0;
			this.lastTouch = 0;
			this.lastChromeDelete = 0;
			this.composing = false;
			this.compositionNode = null;
			this.composingTimeout = -1;
			this.compositionNodes = [];
			this.compositionEndedAt = -2e8;
			this.compositionID = 1;
			this.badSafariComposition = false;
			this.compositionPendingChanges = 0;
			this.domChangeCount = 0;
			this.eventHandlers = Object.create(null);
			this.hideSelectionGuard = null;
		}
	};
	function initInput(view) {
		for (let event in handlers) {
			let handler = handlers[event];
			view.dom.addEventListener(event, view.input.eventHandlers[event] = (event) => {
				if (eventBelongsToView(view, event) && !runCustomHandler(view, event) && (view.editable || !(event.type in editHandlers))) handler(view, event);
			}, passiveHandlers[event] ? { passive: true } : void 0);
		}
		if (safari) view.dom.addEventListener("input", () => null);
		ensureListeners(view);
	}
	function setSelectionOrigin(view, origin) {
		view.input.lastSelectionOrigin = origin;
		view.input.lastSelectionTime = Date.now();
	}
	function destroyInput(view) {
		view.domObserver.stop();
		for (let type in view.input.eventHandlers) view.dom.removeEventListener(type, view.input.eventHandlers[type]);
		clearTimeout(view.input.composingTimeout);
		clearTimeout(view.input.lastIOSEnterFallbackTimeout);
	}
	function ensureListeners(view) {
		view.someProp("handleDOMEvents", (currentHandlers) => {
			for (let type in currentHandlers) if (!view.input.eventHandlers[type]) view.dom.addEventListener(type, view.input.eventHandlers[type] = (event) => runCustomHandler(view, event));
		});
	}
	function runCustomHandler(view, event) {
		return view.someProp("handleDOMEvents", (handlers) => {
			let handler = handlers[event.type];
			return handler ? handler(view, event) || event.defaultPrevented : false;
		});
	}
	function eventBelongsToView(view, event) {
		if (!event.bubbles) return true;
		if (event.defaultPrevented) return false;
		for (let node = event.target; node != view.dom; node = node.parentNode) if (!node || node.nodeType == 11 || node.pmViewDesc && node.pmViewDesc.stopEvent(event)) return false;
		return true;
	}
	function dispatchEvent(view, event) {
		if (!runCustomHandler(view, event) && handlers[event.type] && (view.editable || !(event.type in editHandlers))) handlers[event.type](view, event);
	}
	editHandlers.keydown = (view, _event) => {
		let event = _event;
		view.input.shiftKey = event.keyCode == 16 || event.shiftKey;
		if (inOrNearComposition(view, event)) return;
		view.input.lastKeyCode = event.keyCode;
		view.input.lastKeyCodeTime = Date.now();
		if (android && chrome && event.keyCode == 13) return;
		if (event.keyCode != 229) view.domObserver.forceFlush();
		if (ios && event.keyCode == 13 && !event.ctrlKey && !event.altKey && !event.metaKey) {
			let now = Date.now();
			view.input.lastIOSEnter = now;
			view.input.lastIOSEnterFallbackTimeout = setTimeout(() => {
				if (view.input.lastIOSEnter == now) {
					view.someProp("handleKeyDown", (f) => f(view, keyEvent(13, "Enter")));
					view.input.lastIOSEnter = 0;
				}
			}, 200);
		} else if (view.someProp("handleKeyDown", (f) => f(view, event)) || captureKeyDown(view, event)) event.preventDefault();
		else setSelectionOrigin(view, "key");
	};
	editHandlers.keyup = (view, event) => {
		if (event.keyCode == 16) view.input.shiftKey = false;
	};
	editHandlers.keypress = (view, _event) => {
		let event = _event;
		if (inOrNearComposition(view, event) || !event.charCode || event.ctrlKey && !event.altKey || mac$2 && event.metaKey) return;
		if (view.someProp("handleKeyPress", (f) => f(view, event))) {
			event.preventDefault();
			return;
		}
		let sel = view.state.selection;
		if (!(sel instanceof TextSelection) || !sel.$from.sameParent(sel.$to)) {
			let text = String.fromCharCode(event.charCode);
			let deflt = () => view.state.tr.insertText(text).scrollIntoView();
			if (!/[\r\n]/.test(text) && !view.someProp("handleTextInput", (f) => f(view, sel.$from.pos, sel.$to.pos, text, deflt))) view.dispatch(deflt());
			event.preventDefault();
		}
	};
	function eventCoords(event) {
		return {
			left: event.clientX,
			top: event.clientY
		};
	}
	function isNear(event, click) {
		let dx = click.x - event.clientX, dy = click.y - event.clientY;
		return dx * dx + dy * dy < 100;
	}
	function runHandlerOnContext(view, propName, pos, inside, event) {
		if (inside == -1) return false;
		let $pos = view.state.doc.resolve(inside);
		for (let i = $pos.depth + 1; i > 0; i--) if (view.someProp(propName, (f) => i > $pos.depth ? f(view, pos, $pos.nodeAfter, $pos.before(i), event, true) : f(view, pos, $pos.node(i), $pos.before(i), event, false))) return true;
		return false;
	}
	function updateSelection(view, selection, origin) {
		if (!view.focused) view.focus();
		if (view.state.selection.eq(selection)) return;
		let tr = view.state.tr.setSelection(selection);
		if (origin == "pointer") tr.setMeta("pointer", true);
		view.dispatch(tr);
	}
	function selectClickedLeaf(view, inside) {
		if (inside == -1) return false;
		let $pos = view.state.doc.resolve(inside), node = $pos.nodeAfter;
		if (node && node.isAtom && NodeSelection.isSelectable(node)) {
			updateSelection(view, new NodeSelection($pos), "pointer");
			return true;
		}
		return false;
	}
	function selectClickedNode(view, inside) {
		if (inside == -1) return false;
		let sel = view.state.selection, selectedNode, selectAt;
		if (sel instanceof NodeSelection) selectedNode = sel.node;
		let $pos = view.state.doc.resolve(inside);
		for (let i = $pos.depth + 1; i > 0; i--) {
			let node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
			if (NodeSelection.isSelectable(node)) {
				if (selectedNode && sel.$from.depth > 0 && i >= sel.$from.depth && $pos.before(sel.$from.depth + 1) == sel.$from.pos) selectAt = $pos.before(sel.$from.depth);
				else selectAt = $pos.before(i);
				break;
			}
		}
		if (selectAt != null) {
			updateSelection(view, NodeSelection.create(view.state.doc, selectAt), "pointer");
			return true;
		} else return false;
	}
	function handleSingleClick(view, pos, inside, event, selectNode) {
		return runHandlerOnContext(view, "handleClickOn", pos, inside, event) || view.someProp("handleClick", (f) => f(view, pos, event)) || (selectNode ? selectClickedNode(view, inside) : selectClickedLeaf(view, inside));
	}
	function handleDoubleClick(view, pos, inside, event) {
		return runHandlerOnContext(view, "handleDoubleClickOn", pos, inside, event) || view.someProp("handleDoubleClick", (f) => f(view, pos, event));
	}
	function handleTripleClick(view, pos, inside, event) {
		return runHandlerOnContext(view, "handleTripleClickOn", pos, inside, event) || view.someProp("handleTripleClick", (f) => f(view, pos, event)) || defaultTripleClick(view, inside, event);
	}
	function defaultTripleClick(view, inside, event) {
		if (event.button != 0) return false;
		let doc = view.state.doc;
		if (inside == -1) {
			if (doc.inlineContent) {
				updateSelection(view, TextSelection.create(doc, 0, doc.content.size), "pointer");
				return true;
			}
			return false;
		}
		let $pos = doc.resolve(inside);
		for (let i = $pos.depth + 1; i > 0; i--) {
			let node = i > $pos.depth ? $pos.nodeAfter : $pos.node(i);
			let nodePos = $pos.before(i);
			if (node.inlineContent) updateSelection(view, TextSelection.create(doc, nodePos + 1, nodePos + 1 + node.content.size), "pointer");
			else if (NodeSelection.isSelectable(node)) updateSelection(view, NodeSelection.create(doc, nodePos), "pointer");
			else continue;
			return true;
		}
	}
	function forceDOMFlush(view) {
		return endComposition(view);
	}
	var selectNodeModifier = mac$2 ? "metaKey" : "ctrlKey";
	handlers.mousedown = (view, _event) => {
		let event = _event;
		view.input.shiftKey = event.shiftKey;
		let flushed = forceDOMFlush(view);
		let now = Date.now(), type = "singleClick";
		if (now - view.input.lastClick.time < 500 && isNear(event, view.input.lastClick) && !event[selectNodeModifier] && view.input.lastClick.button == event.button) {
			if (view.input.lastClick.type == "singleClick") type = "doubleClick";
			else if (view.input.lastClick.type == "doubleClick") type = "tripleClick";
		}
		view.input.lastClick = {
			time: now,
			x: event.clientX,
			y: event.clientY,
			type,
			button: event.button
		};
		let pos = view.posAtCoords(eventCoords(event));
		if (!pos) return;
		if (type == "singleClick") {
			if (view.input.mouseDown) view.input.mouseDown.done();
			view.input.mouseDown = new MouseDown(view, pos, event, !!flushed);
		} else if ((type == "doubleClick" ? handleDoubleClick : handleTripleClick)(view, pos.pos, pos.inside, event)) event.preventDefault();
		else setSelectionOrigin(view, "pointer");
	};
	var MouseDown = class {
		constructor(view, pos, event, flushed) {
			this.view = view;
			this.pos = pos;
			this.event = event;
			this.flushed = flushed;
			this.delayedSelectionSync = false;
			this.mightDrag = null;
			this.startDoc = view.state.doc;
			this.selectNode = !!event[selectNodeModifier];
			this.allowDefault = event.shiftKey;
			let targetNode, targetPos;
			if (pos.inside > -1) {
				targetNode = view.state.doc.nodeAt(pos.inside);
				targetPos = pos.inside;
			} else {
				let $pos = view.state.doc.resolve(pos.pos);
				targetNode = $pos.parent;
				targetPos = $pos.depth ? $pos.before() : 0;
			}
			const target = flushed ? null : event.target;
			const targetDesc = target ? view.docView.nearestDesc(target, true) : null;
			this.target = targetDesc && targetDesc.nodeDOM.nodeType == 1 ? targetDesc.nodeDOM : null;
			let { selection } = view.state;
			if (event.button == 0 && (targetNode.type.spec.draggable && targetNode.type.spec.selectable !== false || selection instanceof NodeSelection && selection.from <= targetPos && selection.to > targetPos)) this.mightDrag = {
				node: targetNode,
				pos: targetPos,
				addAttr: !!(this.target && !this.target.draggable),
				setUneditable: !!(this.target && gecko && !this.target.hasAttribute("contentEditable"))
			};
			if (this.target && this.mightDrag && (this.mightDrag.addAttr || this.mightDrag.setUneditable)) {
				this.view.domObserver.stop();
				if (this.mightDrag.addAttr) this.target.draggable = true;
				if (this.mightDrag.setUneditable) setTimeout(() => {
					if (this.view.input.mouseDown == this) this.target.setAttribute("contentEditable", "false");
				}, 20);
				this.view.domObserver.start();
			}
			view.root.addEventListener("mouseup", this.up = this.up.bind(this));
			view.root.addEventListener("mousemove", this.move = this.move.bind(this));
			setSelectionOrigin(view, "pointer");
		}
		done() {
			this.view.root.removeEventListener("mouseup", this.up);
			this.view.root.removeEventListener("mousemove", this.move);
			if (this.mightDrag && this.target) {
				this.view.domObserver.stop();
				if (this.mightDrag.addAttr) this.target.removeAttribute("draggable");
				if (this.mightDrag.setUneditable) this.target.removeAttribute("contentEditable");
				this.view.domObserver.start();
			}
			if (this.delayedSelectionSync) setTimeout(() => selectionToDOM(this.view));
			this.view.input.mouseDown = null;
		}
		up(event) {
			this.done();
			if (!this.view.dom.contains(event.target)) return;
			let pos = this.pos;
			if (this.view.state.doc != this.startDoc) pos = this.view.posAtCoords(eventCoords(event));
			this.updateAllowDefault(event);
			if (this.allowDefault || !pos) setSelectionOrigin(this.view, "pointer");
			else if (handleSingleClick(this.view, pos.pos, pos.inside, event, this.selectNode)) event.preventDefault();
			else if (event.button == 0 && (this.flushed || safari && this.mightDrag && !this.mightDrag.node.isAtom || chrome && !this.view.state.selection.visible && Math.min(Math.abs(pos.pos - this.view.state.selection.from), Math.abs(pos.pos - this.view.state.selection.to)) <= 2)) {
				updateSelection(this.view, Selection.near(this.view.state.doc.resolve(pos.pos)), "pointer");
				event.preventDefault();
			} else setSelectionOrigin(this.view, "pointer");
		}
		move(event) {
			this.updateAllowDefault(event);
			setSelectionOrigin(this.view, "pointer");
			if (event.buttons == 0) this.done();
		}
		updateAllowDefault(event) {
			if (!this.allowDefault && (Math.abs(this.event.x - event.clientX) > 4 || Math.abs(this.event.y - event.clientY) > 4)) this.allowDefault = true;
		}
	};
	handlers.touchstart = (view) => {
		view.input.lastTouch = Date.now();
		forceDOMFlush(view);
		setSelectionOrigin(view, "pointer");
	};
	handlers.touchmove = (view) => {
		view.input.lastTouch = Date.now();
		setSelectionOrigin(view, "pointer");
	};
	handlers.contextmenu = (view) => forceDOMFlush(view);
	function inOrNearComposition(view, event) {
		if (view.composing) return true;
		if (safari && Math.abs(event.timeStamp - view.input.compositionEndedAt) < 500) {
			view.input.compositionEndedAt = -2e8;
			return true;
		}
		return false;
	}
	var timeoutComposition = android ? 5e3 : -1;
	editHandlers.compositionstart = editHandlers.compositionupdate = (view) => {
		if (!view.composing) {
			view.domObserver.flush();
			let { state } = view, $pos = state.selection.$to;
			if (state.selection instanceof TextSelection && (state.storedMarks || !$pos.textOffset && $pos.parentOffset && $pos.nodeBefore.marks.some((m) => m.type.spec.inclusive === false) || chrome && windows$1 && selectionBeforeUneditable(view))) {
				view.markCursor = view.state.storedMarks || $pos.marks();
				endComposition(view, true);
				view.markCursor = null;
			} else {
				endComposition(view, !state.selection.empty);
				if (gecko && state.selection.empty && $pos.parentOffset && !$pos.textOffset && $pos.nodeBefore.marks.length) {
					let sel = view.domSelectionRange();
					for (let node = sel.focusNode, offset = sel.focusOffset; node && node.nodeType == 1 && offset != 0;) {
						let before = offset < 0 ? node.lastChild : node.childNodes[offset - 1];
						if (!before) break;
						if (before.nodeType == 3) {
							let sel = view.domSelection();
							if (sel) sel.collapse(before, before.nodeValue.length);
							break;
						} else {
							node = before;
							offset = -1;
						}
					}
				}
			}
			view.input.composing = true;
		}
		scheduleComposeEnd(view, timeoutComposition);
	};
	function selectionBeforeUneditable(view) {
		let { focusNode, focusOffset } = view.domSelectionRange();
		if (!focusNode || focusNode.nodeType != 1 || focusOffset >= focusNode.childNodes.length) return false;
		let next = focusNode.childNodes[focusOffset];
		return next.nodeType == 1 && next.contentEditable == "false";
	}
	editHandlers.compositionend = (view, event) => {
		if (view.composing) {
			view.input.composing = false;
			view.input.compositionEndedAt = event.timeStamp;
			view.input.compositionPendingChanges = view.domObserver.pendingRecords().length ? view.input.compositionID : 0;
			view.input.compositionNode = null;
			if (view.input.badSafariComposition) view.domObserver.forceFlush();
			else if (view.input.compositionPendingChanges) Promise.resolve().then(() => view.domObserver.flush());
			view.input.compositionID++;
			scheduleComposeEnd(view, 20);
		}
	};
	function scheduleComposeEnd(view, delay) {
		clearTimeout(view.input.composingTimeout);
		if (delay > -1) view.input.composingTimeout = setTimeout(() => endComposition(view), delay);
	}
	function clearComposition(view) {
		if (view.composing) {
			view.input.composing = false;
			view.input.compositionEndedAt = timestampFromCustomEvent();
		}
		while (view.input.compositionNodes.length > 0) view.input.compositionNodes.pop().markParentsDirty();
	}
	function findCompositionNode(view) {
		let sel = view.domSelectionRange();
		if (!sel.focusNode) return null;
		let textBefore = textNodeBefore$1(sel.focusNode, sel.focusOffset);
		let textAfter = textNodeAfter$1(sel.focusNode, sel.focusOffset);
		if (textBefore && textAfter && textBefore != textAfter) {
			let descAfter = textAfter.pmViewDesc, lastChanged = view.domObserver.lastChangedTextNode;
			if (textBefore == lastChanged || textAfter == lastChanged) return lastChanged;
			if (!descAfter || !descAfter.isText(textAfter.nodeValue)) return textAfter;
			else if (view.input.compositionNode == textAfter) {
				let descBefore = textBefore.pmViewDesc;
				if (!(!descBefore || !descBefore.isText(textBefore.nodeValue))) return textAfter;
			}
		}
		return textBefore || textAfter;
	}
	function timestampFromCustomEvent() {
		let event = document.createEvent("Event");
		event.initEvent("event", true, true);
		return event.timeStamp;
	}
	/**
	@internal
	*/
	function endComposition(view, restarting = false) {
		if (android && view.domObserver.flushingSoon >= 0) return;
		view.domObserver.forceFlush();
		clearComposition(view);
		if (restarting || view.docView && view.docView.dirty) {
			let sel = selectionFromDOM(view), cur = view.state.selection;
			if (sel && !sel.eq(cur)) view.dispatch(view.state.tr.setSelection(sel));
			else if ((view.markCursor || restarting) && !cur.$from.node(cur.$from.sharedDepth(cur.to)).inlineContent) view.dispatch(view.state.tr.deleteSelection());
			else view.updateState(view.state);
			return true;
		}
		return false;
	}
	function captureCopy(view, dom) {
		if (!view.dom.parentNode) return;
		let wrap = view.dom.parentNode.appendChild(document.createElement("div"));
		wrap.appendChild(dom);
		wrap.style.cssText = "position: fixed; left: -10000px; top: 10px";
		let sel = getSelection(), range = document.createRange();
		range.selectNodeContents(dom);
		view.dom.blur();
		sel.removeAllRanges();
		sel.addRange(range);
		setTimeout(() => {
			if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
			view.focus();
		}, 50);
	}
	var brokenClipboardAPI = ie$1 && ie_version < 15 || ios && webkit_version < 604;
	handlers.copy = editHandlers.cut = (view, _event) => {
		let event = _event;
		let sel = view.state.selection, cut = event.type == "cut";
		if (sel.empty) return;
		let data = brokenClipboardAPI ? null : event.clipboardData;
		let { dom, text } = serializeForClipboard(view, sel.content());
		if (data) {
			event.preventDefault();
			data.clearData();
			data.setData("text/html", dom.innerHTML);
			data.setData("text/plain", text);
		} else captureCopy(view, dom);
		if (cut) view.dispatch(view.state.tr.deleteSelection().scrollIntoView().setMeta("uiEvent", "cut"));
	};
	function sliceSingleNode(slice) {
		return slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1 ? slice.content.firstChild : null;
	}
	function capturePaste(view, event) {
		if (!view.dom.parentNode) return;
		let plainText = view.input.shiftKey || view.state.selection.$from.parent.type.spec.code;
		let target = view.dom.parentNode.appendChild(document.createElement(plainText ? "textarea" : "div"));
		if (!plainText) target.contentEditable = "true";
		target.style.cssText = "position: fixed; left: -10000px; top: 10px";
		target.focus();
		let plain = view.input.shiftKey && view.input.lastKeyCode != 45;
		setTimeout(() => {
			view.focus();
			if (target.parentNode) target.parentNode.removeChild(target);
			if (plainText) doPaste(view, target.value, null, plain, event);
			else doPaste(view, target.textContent, target.innerHTML, plain, event);
		}, 50);
	}
	function doPaste(view, text, html, preferPlain, event) {
		let slice = parseFromClipboard(view, text, html, preferPlain, view.state.selection.$from);
		if (view.someProp("handlePaste", (f) => f(view, event, slice || Slice.empty))) return true;
		if (!slice) return false;
		let singleNode = sliceSingleNode(slice);
		let tr = singleNode ? view.state.tr.replaceSelectionWith(singleNode, preferPlain) : view.state.tr.replaceSelection(slice);
		view.dispatch(tr.scrollIntoView().setMeta("paste", true).setMeta("uiEvent", "paste"));
		return true;
	}
	function getText(clipboardData) {
		let text = clipboardData.getData("text/plain") || clipboardData.getData("Text");
		if (text) return text;
		let uris = clipboardData.getData("text/uri-list");
		return uris ? uris.replace(/\r?\n/g, " ") : "";
	}
	editHandlers.paste = (view, _event) => {
		let event = _event;
		if (view.composing && !android) return;
		let data = brokenClipboardAPI ? null : event.clipboardData;
		let plain = view.input.shiftKey && view.input.lastKeyCode != 45;
		if (data && doPaste(view, getText(data), data.getData("text/html"), plain, event)) event.preventDefault();
		else capturePaste(view, event);
	};
	var Dragging = class {
		constructor(slice, move, node) {
			this.slice = slice;
			this.move = move;
			this.node = node;
		}
	};
	var dragCopyModifier = mac$2 ? "altKey" : "ctrlKey";
	function dragMoves(view, event) {
		let copy;
		view.someProp("dragCopies", (test) => {
			copy = copy || test(event);
		});
		return copy != null ? !copy : !event[dragCopyModifier];
	}
	handlers.dragstart = (view, _event) => {
		let event = _event;
		let mouseDown = view.input.mouseDown;
		if (mouseDown) mouseDown.done();
		if (!event.dataTransfer) return;
		let sel = view.state.selection;
		let pos = sel.empty ? null : view.posAtCoords(eventCoords(event));
		let node;
		if (pos && pos.pos >= sel.from && pos.pos <= (sel instanceof NodeSelection ? sel.to - 1 : sel.to));
		else if (mouseDown && mouseDown.mightDrag) node = NodeSelection.create(view.state.doc, mouseDown.mightDrag.pos);
		else if (event.target && event.target.nodeType == 1) {
			let desc = view.docView.nearestDesc(event.target, true);
			if (desc && desc.node.type.spec.draggable && desc != view.docView) node = NodeSelection.create(view.state.doc, desc.posBefore);
		}
		let { dom, text, slice } = serializeForClipboard(view, (node || view.state.selection).content());
		if (!event.dataTransfer.files.length || !chrome || chrome_version > 120) event.dataTransfer.clearData();
		event.dataTransfer.setData(brokenClipboardAPI ? "Text" : "text/html", dom.innerHTML);
		event.dataTransfer.effectAllowed = "copyMove";
		if (!brokenClipboardAPI) event.dataTransfer.setData("text/plain", text);
		view.dragging = new Dragging(slice, dragMoves(view, event), node);
	};
	handlers.dragend = (view) => {
		let dragging = view.dragging;
		window.setTimeout(() => {
			if (view.dragging == dragging) view.dragging = null;
		}, 50);
	};
	editHandlers.dragover = editHandlers.dragenter = (_, e) => e.preventDefault();
	editHandlers.drop = (view, event) => {
		try {
			handleDrop(view, event, view.dragging);
		} finally {
			view.dragging = null;
		}
	};
	function handleDrop(view, event, dragging) {
		if (!event.dataTransfer) return;
		let eventPos = view.posAtCoords(eventCoords(event));
		if (!eventPos) return;
		let $mouse = view.state.doc.resolve(eventPos.pos);
		let slice = dragging && dragging.slice;
		if (slice) view.someProp("transformPasted", (f) => {
			slice = f(slice, view, false);
		});
		else slice = parseFromClipboard(view, getText(event.dataTransfer), brokenClipboardAPI ? null : event.dataTransfer.getData("text/html"), false, $mouse);
		let move = !!(dragging && dragMoves(view, event));
		if (view.someProp("handleDrop", (f) => f(view, event, slice || Slice.empty, move))) {
			event.preventDefault();
			return;
		}
		if (!slice) return;
		event.preventDefault();
		let insertPos = slice ? dropPoint(view.state.doc, $mouse.pos, slice) : $mouse.pos;
		if (insertPos == null) insertPos = $mouse.pos;
		let tr = view.state.tr;
		if (move) {
			let { node } = dragging;
			if (node) node.replace(tr);
			else tr.deleteSelection();
		}
		let pos = tr.mapping.map(insertPos);
		let isNode = slice.openStart == 0 && slice.openEnd == 0 && slice.content.childCount == 1;
		let beforeInsert = tr.doc;
		if (isNode) tr.replaceRangeWith(pos, pos, slice.content.firstChild);
		else tr.replaceRange(pos, pos, slice);
		if (tr.doc.eq(beforeInsert)) return;
		let $pos = tr.doc.resolve(pos);
		if (isNode && NodeSelection.isSelectable(slice.content.firstChild) && $pos.nodeAfter && $pos.nodeAfter.sameMarkup(slice.content.firstChild)) tr.setSelection(new NodeSelection($pos));
		else {
			let end = tr.mapping.map(insertPos);
			tr.mapping.maps[tr.mapping.maps.length - 1].forEach((_from, _to, _newFrom, newTo) => end = newTo);
			tr.setSelection(selectionBetween(view, $pos, tr.doc.resolve(end)));
		}
		view.focus();
		view.dispatch(tr.setMeta("uiEvent", "drop"));
	}
	handlers.focus = (view) => {
		view.input.lastFocus = Date.now();
		if (!view.focused) {
			view.domObserver.stop();
			view.dom.classList.add("ProseMirror-focused");
			view.domObserver.start();
			view.focused = true;
			setTimeout(() => {
				if (view.docView && view.hasFocus() && !view.domObserver.currentSelection.eq(view.domSelectionRange())) selectionToDOM(view);
			}, 20);
		}
	};
	handlers.blur = (view, _event) => {
		let event = _event;
		if (view.focused) {
			view.domObserver.stop();
			view.dom.classList.remove("ProseMirror-focused");
			view.domObserver.start();
			if (event.relatedTarget && view.dom.contains(event.relatedTarget)) view.domObserver.currentSelection.clear();
			view.focused = false;
		}
	};
	handlers.beforeinput = (view, _event) => {
		if (chrome && android && _event.inputType == "deleteContentBackward") {
			view.domObserver.flushSoon();
			let { domChangeCount } = view.input;
			setTimeout(() => {
				if (view.input.domChangeCount != domChangeCount) return;
				view.dom.blur();
				view.focus();
				if (view.someProp("handleKeyDown", (f) => f(view, keyEvent(8, "Backspace")))) return;
				let { $cursor } = view.state.selection;
				if ($cursor && $cursor.pos > 0) view.dispatch(view.state.tr.delete($cursor.pos - 1, $cursor.pos).scrollIntoView());
			}, 50);
		}
	};
	for (let prop in editHandlers) handlers[prop] = editHandlers[prop];
	function compareObjs(a, b) {
		if (a == b) return true;
		for (let p in a) if (a[p] !== b[p]) return false;
		for (let p in b) if (!(p in a)) return false;
		return true;
	}
	var WidgetType = class WidgetType {
		constructor(toDOM, spec) {
			this.toDOM = toDOM;
			this.spec = spec || noSpec;
			this.side = this.spec.side || 0;
		}
		map(mapping, span, offset, oldOffset) {
			let { pos, deleted } = mapping.mapResult(span.from + oldOffset, this.side < 0 ? -1 : 1);
			return deleted ? null : new Decoration(pos - offset, pos - offset, this);
		}
		valid() {
			return true;
		}
		eq(other) {
			return this == other || other instanceof WidgetType && (this.spec.key && this.spec.key == other.spec.key || this.toDOM == other.toDOM && compareObjs(this.spec, other.spec));
		}
		destroy(node) {
			if (this.spec.destroy) this.spec.destroy(node);
		}
	};
	var InlineType = class InlineType {
		constructor(attrs, spec) {
			this.attrs = attrs;
			this.spec = spec || noSpec;
		}
		map(mapping, span, offset, oldOffset) {
			let from = mapping.map(span.from + oldOffset, this.spec.inclusiveStart ? -1 : 1) - offset;
			let to = mapping.map(span.to + oldOffset, this.spec.inclusiveEnd ? 1 : -1) - offset;
			return from >= to ? null : new Decoration(from, to, this);
		}
		valid(_, span) {
			return span.from < span.to;
		}
		eq(other) {
			return this == other || other instanceof InlineType && compareObjs(this.attrs, other.attrs) && compareObjs(this.spec, other.spec);
		}
		static is(span) {
			return span.type instanceof InlineType;
		}
		destroy() {}
	};
	var NodeType = class NodeType {
		constructor(attrs, spec) {
			this.attrs = attrs;
			this.spec = spec || noSpec;
		}
		map(mapping, span, offset, oldOffset) {
			let from = mapping.mapResult(span.from + oldOffset, 1);
			if (from.deleted) return null;
			let to = mapping.mapResult(span.to + oldOffset, -1);
			if (to.deleted || to.pos <= from.pos) return null;
			return new Decoration(from.pos - offset, to.pos - offset, this);
		}
		valid(node, span) {
			let { index, offset } = node.content.findIndex(span.from), child;
			return offset == span.from && !(child = node.child(index)).isText && offset + child.nodeSize == span.to;
		}
		eq(other) {
			return this == other || other instanceof NodeType && compareObjs(this.attrs, other.attrs) && compareObjs(this.spec, other.spec);
		}
		destroy() {}
	};
	/**
	Decoration objects can be provided to the view through the
	[`decorations` prop](https://prosemirror.net/docs/ref/#view.EditorProps.decorations). They come in
	several variants—see the static members of this class for details.
	*/
	var Decoration = class Decoration {
		/**
		@internal
		*/
		constructor(from, to, type) {
			this.from = from;
			this.to = to;
			this.type = type;
		}
		/**
		@internal
		*/
		copy(from, to) {
			return new Decoration(from, to, this.type);
		}
		/**
		@internal
		*/
		eq(other, offset = 0) {
			return this.type.eq(other.type) && this.from + offset == other.from && this.to + offset == other.to;
		}
		/**
		@internal
		*/
		map(mapping, offset, oldOffset) {
			return this.type.map(mapping, this, offset, oldOffset);
		}
		/**
		Creates a widget decoration, which is a DOM node that's shown in
		the document at the given position. It is recommended that you
		delay rendering the widget by passing a function that will be
		called when the widget is actually drawn in a view, but you can
		also directly pass a DOM node. `getPos` can be used to find the
		widget's current document position.
		*/
		static widget(pos, toDOM, spec) {
			return new Decoration(pos, pos, new WidgetType(toDOM, spec));
		}
		/**
		Creates an inline decoration, which adds the given attributes to
		each inline node between `from` and `to`.
		*/
		static inline(from, to, attrs, spec) {
			return new Decoration(from, to, new InlineType(attrs, spec));
		}
		/**
		Creates a node decoration. `from` and `to` should point precisely
		before and after a node in the document. That node, and only that
		node, will receive the given attributes.
		*/
		static node(from, to, attrs, spec) {
			return new Decoration(from, to, new NodeType(attrs, spec));
		}
		/**
		The spec provided when creating this decoration. Can be useful
		if you've stored extra information in that object.
		*/
		get spec() {
			return this.type.spec;
		}
		/**
		@internal
		*/
		get inline() {
			return this.type instanceof InlineType;
		}
		/**
		@internal
		*/
		get widget() {
			return this.type instanceof WidgetType;
		}
	};
	var none = [], noSpec = {};
	/**
	A collection of [decorations](https://prosemirror.net/docs/ref/#view.Decoration), organized in such
	a way that the drawing algorithm can efficiently use and compare
	them. This is a persistent data structure—it is not modified,
	updates create a new value.
	*/
	var DecorationSet = class DecorationSet {
		/**
		@internal
		*/
		constructor(local, children) {
			this.local = local.length ? local : none;
			this.children = children.length ? children : none;
		}
		/**
		Create a set of decorations, using the structure of the given
		document. This will consume (modify) the `decorations` array, so
		you must make a copy if you want need to preserve that.
		*/
		static create(doc, decorations) {
			return decorations.length ? buildTree(decorations, doc, 0, noSpec) : empty$2;
		}
		/**
		Find all decorations in this set which touch the given range
		(including decorations that start or end directly at the
		boundaries) and match the given predicate on their spec. When
		`start` and `end` are omitted, all decorations in the set are
		considered. When `predicate` isn't given, all decorations are
		assumed to match.
		*/
		find(start, end, predicate) {
			let result = [];
			this.findInner(start == null ? 0 : start, end == null ? 1e9 : end, result, 0, predicate);
			return result;
		}
		findInner(start, end, result, offset, predicate) {
			for (let i = 0; i < this.local.length; i++) {
				let span = this.local[i];
				if (span.from <= end && span.to >= start && (!predicate || predicate(span.spec))) result.push(span.copy(span.from + offset, span.to + offset));
			}
			for (let i = 0; i < this.children.length; i += 3) if (this.children[i] < end && this.children[i + 1] > start) {
				let childOff = this.children[i] + 1;
				this.children[i + 2].findInner(start - childOff, end - childOff, result, offset + childOff, predicate);
			}
		}
		/**
		Map the set of decorations in response to a change in the
		document.
		*/
		map(mapping, doc, options) {
			if (this == empty$2 || mapping.maps.length == 0) return this;
			return this.mapInner(mapping, doc, 0, 0, options || noSpec);
		}
		/**
		@internal
		*/
		mapInner(mapping, node, offset, oldOffset, options) {
			let newLocal;
			for (let i = 0; i < this.local.length; i++) {
				let mapped = this.local[i].map(mapping, offset, oldOffset);
				if (mapped && mapped.type.valid(node, mapped)) (newLocal || (newLocal = [])).push(mapped);
				else if (options.onRemove) options.onRemove(this.local[i].spec);
			}
			if (this.children.length) return mapChildren(this.children, newLocal || [], mapping, node, offset, oldOffset, options);
			else return newLocal ? new DecorationSet(newLocal.sort(byPos), none) : empty$2;
		}
		/**
		Add the given array of decorations to the ones in the set,
		producing a new set. Consumes the `decorations` array. Needs
		access to the current document to create the appropriate tree
		structure.
		*/
		add(doc, decorations) {
			if (!decorations.length) return this;
			if (this == empty$2) return DecorationSet.create(doc, decorations);
			return this.addInner(doc, decorations, 0);
		}
		addInner(doc, decorations, offset) {
			let children, childIndex = 0;
			doc.forEach((childNode, childOffset) => {
				let baseOffset = childOffset + offset, found;
				if (!(found = takeSpansForNode(decorations, childNode, baseOffset))) return;
				if (!children) children = this.children.slice();
				while (childIndex < children.length && children[childIndex] < childOffset) childIndex += 3;
				if (children[childIndex] == childOffset) children[childIndex + 2] = children[childIndex + 2].addInner(childNode, found, baseOffset + 1);
				else children.splice(childIndex, 0, childOffset, childOffset + childNode.nodeSize, buildTree(found, childNode, baseOffset + 1, noSpec));
				childIndex += 3;
			});
			let local = moveSpans(childIndex ? withoutNulls(decorations) : decorations, -offset);
			for (let i = 0; i < local.length; i++) if (!local[i].type.valid(doc, local[i])) local.splice(i--, 1);
			return new DecorationSet(local.length ? this.local.concat(local).sort(byPos) : this.local, children || this.children);
		}
		/**
		Create a new set that contains the decorations in this set, minus
		the ones in the given array.
		*/
		remove(decorations) {
			if (decorations.length == 0 || this == empty$2) return this;
			return this.removeInner(decorations, 0);
		}
		removeInner(decorations, offset) {
			let children = this.children, local = this.local;
			for (let i = 0; i < children.length; i += 3) {
				let found;
				let from = children[i] + offset, to = children[i + 1] + offset;
				for (let j = 0, span; j < decorations.length; j++) if (span = decorations[j]) {
					if (span.from > from && span.to < to) {
						decorations[j] = null;
						(found || (found = [])).push(span);
					}
				}
				if (!found) continue;
				if (children == this.children) children = this.children.slice();
				let removed = children[i + 2].removeInner(found, from + 1);
				if (removed != empty$2) children[i + 2] = removed;
				else {
					children.splice(i, 3);
					i -= 3;
				}
			}
			if (local.length) {
				for (let i = 0, span; i < decorations.length; i++) if (span = decorations[i]) {
					for (let j = 0; j < local.length; j++) if (local[j].eq(span, offset)) {
						if (local == this.local) local = this.local.slice();
						local.splice(j--, 1);
					}
				}
			}
			if (children == this.children && local == this.local) return this;
			return local.length || children.length ? new DecorationSet(local, children) : empty$2;
		}
		forChild(offset, node) {
			if (this == empty$2) return this;
			if (node.isLeaf) return DecorationSet.empty;
			let child, local;
			for (let i = 0; i < this.children.length; i += 3) if (this.children[i] >= offset) {
				if (this.children[i] == offset) child = this.children[i + 2];
				break;
			}
			let start = offset + 1, end = start + node.content.size;
			for (let i = 0; i < this.local.length; i++) {
				let dec = this.local[i];
				if (dec.from < end && dec.to > start && dec.type instanceof InlineType) {
					let from = Math.max(start, dec.from) - start, to = Math.min(end, dec.to) - start;
					if (from < to) (local || (local = [])).push(dec.copy(from, to));
				}
			}
			if (local) {
				let localSet = new DecorationSet(local.sort(byPos), none);
				return child ? new DecorationGroup([localSet, child]) : localSet;
			}
			return child || empty$2;
		}
		/**
		@internal
		*/
		eq(other) {
			if (this == other) return true;
			if (!(other instanceof DecorationSet) || this.local.length != other.local.length || this.children.length != other.children.length) return false;
			for (let i = 0; i < this.local.length; i++) if (!this.local[i].eq(other.local[i])) return false;
			for (let i = 0; i < this.children.length; i += 3) if (this.children[i] != other.children[i] || this.children[i + 1] != other.children[i + 1] || !this.children[i + 2].eq(other.children[i + 2])) return false;
			return true;
		}
		/**
		@internal
		*/
		locals(node) {
			return removeOverlap(this.localsInner(node));
		}
		/**
		@internal
		*/
		localsInner(node) {
			if (this == empty$2) return none;
			if (node.inlineContent || !this.local.some(InlineType.is)) return this.local;
			let result = [];
			for (let i = 0; i < this.local.length; i++) if (!(this.local[i].type instanceof InlineType)) result.push(this.local[i]);
			return result;
		}
		forEachSet(f) {
			f(this);
		}
	};
	/**
	The empty set of decorations.
	*/
	DecorationSet.empty = new DecorationSet([], []);
	/**
	@internal
	*/
	DecorationSet.removeOverlap = removeOverlap;
	var empty$2 = DecorationSet.empty;
	var DecorationGroup = class DecorationGroup {
		constructor(members) {
			this.members = members;
		}
		map(mapping, doc) {
			const mappedDecos = this.members.map((member) => member.map(mapping, doc, noSpec));
			return DecorationGroup.from(mappedDecos);
		}
		forChild(offset, child) {
			if (child.isLeaf) return DecorationSet.empty;
			let found = [];
			for (let i = 0; i < this.members.length; i++) {
				let result = this.members[i].forChild(offset, child);
				if (result == empty$2) continue;
				if (result instanceof DecorationGroup) found = found.concat(result.members);
				else found.push(result);
			}
			return DecorationGroup.from(found);
		}
		eq(other) {
			if (!(other instanceof DecorationGroup) || other.members.length != this.members.length) return false;
			for (let i = 0; i < this.members.length; i++) if (!this.members[i].eq(other.members[i])) return false;
			return true;
		}
		locals(node) {
			let result, sorted = true;
			for (let i = 0; i < this.members.length; i++) {
				let locals = this.members[i].localsInner(node);
				if (!locals.length) continue;
				if (!result) result = locals;
				else {
					if (sorted) {
						result = result.slice();
						sorted = false;
					}
					for (let j = 0; j < locals.length; j++) result.push(locals[j]);
				}
			}
			return result ? removeOverlap(sorted ? result : result.sort(byPos)) : none;
		}
		static from(members) {
			switch (members.length) {
				case 0: return empty$2;
				case 1: return members[0];
				default: return new DecorationGroup(members.every((m) => m instanceof DecorationSet) ? members : members.reduce((r, m) => r.concat(m instanceof DecorationSet ? m : m.members), []));
			}
		}
		forEachSet(f) {
			for (let i = 0; i < this.members.length; i++) this.members[i].forEachSet(f);
		}
	};
	function mapChildren(oldChildren, newLocal, mapping, node, offset, oldOffset, options) {
		let children = oldChildren.slice();
		for (let i = 0, baseOffset = oldOffset; i < mapping.maps.length; i++) {
			let moved = 0;
			mapping.maps[i].forEach((oldStart, oldEnd, newStart, newEnd) => {
				let dSize = newEnd - newStart - (oldEnd - oldStart);
				for (let i = 0; i < children.length; i += 3) {
					let end = children[i + 1];
					if (end < 0 || oldStart > end + baseOffset - moved) continue;
					let start = children[i] + baseOffset - moved;
					if (oldEnd >= start) children[i + 1] = oldStart <= start ? -2 : -1;
					else if (oldStart >= baseOffset && dSize) {
						children[i] += dSize;
						children[i + 1] += dSize;
					}
				}
				moved += dSize;
			});
			baseOffset = mapping.maps[i].map(baseOffset, -1);
		}
		let mustRebuild = false;
		for (let i = 0; i < children.length; i += 3) if (children[i + 1] < 0) {
			if (children[i + 1] == -2) {
				mustRebuild = true;
				children[i + 1] = -1;
				continue;
			}
			let from = mapping.map(oldChildren[i] + oldOffset), fromLocal = from - offset;
			if (fromLocal < 0 || fromLocal >= node.content.size) {
				mustRebuild = true;
				continue;
			}
			let toLocal = mapping.map(oldChildren[i + 1] + oldOffset, -1) - offset;
			let { index, offset: childOffset } = node.content.findIndex(fromLocal);
			let childNode = node.maybeChild(index);
			if (childNode && childOffset == fromLocal && childOffset + childNode.nodeSize == toLocal) {
				let mapped = children[i + 2].mapInner(mapping, childNode, from + 1, oldChildren[i] + oldOffset + 1, options);
				if (mapped != empty$2) {
					children[i] = fromLocal;
					children[i + 1] = toLocal;
					children[i + 2] = mapped;
				} else {
					children[i + 1] = -2;
					mustRebuild = true;
				}
			} else mustRebuild = true;
		}
		if (mustRebuild) {
			let built = buildTree(mapAndGatherRemainingDecorations(children, oldChildren, newLocal, mapping, offset, oldOffset, options), node, 0, options);
			newLocal = built.local;
			for (let i = 0; i < children.length; i += 3) if (children[i + 1] < 0) {
				children.splice(i, 3);
				i -= 3;
			}
			for (let i = 0, j = 0; i < built.children.length; i += 3) {
				let from = built.children[i];
				while (j < children.length && children[j] < from) j += 3;
				children.splice(j, 0, built.children[i], built.children[i + 1], built.children[i + 2]);
			}
		}
		return new DecorationSet(newLocal.sort(byPos), children);
	}
	function moveSpans(spans, offset) {
		if (!offset || !spans.length) return spans;
		let result = [];
		for (let i = 0; i < spans.length; i++) {
			let span = spans[i];
			result.push(new Decoration(span.from + offset, span.to + offset, span.type));
		}
		return result;
	}
	function mapAndGatherRemainingDecorations(children, oldChildren, decorations, mapping, offset, oldOffset, options) {
		function gather(set, oldOffset) {
			for (let i = 0; i < set.local.length; i++) {
				let mapped = set.local[i].map(mapping, offset, oldOffset);
				if (mapped) decorations.push(mapped);
				else if (options.onRemove) options.onRemove(set.local[i].spec);
			}
			for (let i = 0; i < set.children.length; i += 3) gather(set.children[i + 2], set.children[i] + oldOffset + 1);
		}
		for (let i = 0; i < children.length; i += 3) if (children[i + 1] == -1) gather(children[i + 2], oldChildren[i] + oldOffset + 1);
		return decorations;
	}
	function takeSpansForNode(spans, node, offset) {
		if (node.isLeaf) return null;
		let end = offset + node.nodeSize, found = null;
		for (let i = 0, span; i < spans.length; i++) if ((span = spans[i]) && span.from > offset && span.to < end) {
			(found || (found = [])).push(span);
			spans[i] = null;
		}
		return found;
	}
	function withoutNulls(array) {
		let result = [];
		for (let i = 0; i < array.length; i++) if (array[i] != null) result.push(array[i]);
		return result;
	}
	function buildTree(spans, node, offset, options) {
		let children = [], hasNulls = false;
		node.forEach((childNode, localStart) => {
			let found = takeSpansForNode(spans, childNode, localStart + offset);
			if (found) {
				hasNulls = true;
				let subtree = buildTree(found, childNode, offset + localStart + 1, options);
				if (subtree != empty$2) children.push(localStart, localStart + childNode.nodeSize, subtree);
			}
		});
		let locals = moveSpans(hasNulls ? withoutNulls(spans) : spans, -offset).sort(byPos);
		for (let i = 0; i < locals.length; i++) if (!locals[i].type.valid(node, locals[i])) {
			if (options.onRemove) options.onRemove(locals[i].spec);
			locals.splice(i--, 1);
		}
		return locals.length || children.length ? new DecorationSet(locals, children) : empty$2;
	}
	function byPos(a, b) {
		return a.from - b.from || a.to - b.to;
	}
	function removeOverlap(spans) {
		let working = spans;
		for (let i = 0; i < working.length - 1; i++) {
			let span = working[i];
			if (span.from != span.to) for (let j = i + 1; j < working.length; j++) {
				let next = working[j];
				if (next.from == span.from) {
					if (next.to != span.to) {
						if (working == spans) working = spans.slice();
						working[j] = next.copy(next.from, span.to);
						insertAhead(working, j + 1, next.copy(span.to, next.to));
					}
					continue;
				} else {
					if (next.from < span.to) {
						if (working == spans) working = spans.slice();
						working[i] = span.copy(span.from, next.from);
						insertAhead(working, j, span.copy(next.from, span.to));
					}
					break;
				}
			}
		}
		return working;
	}
	function insertAhead(array, i, deco) {
		while (i < array.length && byPos(deco, array[i]) > 0) i++;
		array.splice(i, 0, deco);
	}
	function viewDecorations(view) {
		let found = [];
		view.someProp("decorations", (f) => {
			let result = f(view.state);
			if (result && result != empty$2) found.push(result);
		});
		if (view.cursorWrapper) found.push(DecorationSet.create(view.state.doc, [view.cursorWrapper.deco]));
		return DecorationGroup.from(found);
	}
	var observeOptions = {
		childList: true,
		characterData: true,
		characterDataOldValue: true,
		attributes: true,
		attributeOldValue: true,
		subtree: true
	};
	var useCharData = ie$1 && ie_version <= 11;
	var SelectionState = class {
		constructor() {
			this.anchorNode = null;
			this.anchorOffset = 0;
			this.focusNode = null;
			this.focusOffset = 0;
		}
		set(sel) {
			this.anchorNode = sel.anchorNode;
			this.anchorOffset = sel.anchorOffset;
			this.focusNode = sel.focusNode;
			this.focusOffset = sel.focusOffset;
		}
		clear() {
			this.anchorNode = this.focusNode = null;
		}
		eq(sel) {
			return sel.anchorNode == this.anchorNode && sel.anchorOffset == this.anchorOffset && sel.focusNode == this.focusNode && sel.focusOffset == this.focusOffset;
		}
	};
	var DOMObserver = class {
		constructor(view, handleDOMChange) {
			this.view = view;
			this.handleDOMChange = handleDOMChange;
			this.queue = [];
			this.flushingSoon = -1;
			this.observer = null;
			this.currentSelection = new SelectionState();
			this.onCharData = null;
			this.suppressingSelectionUpdates = false;
			this.lastChangedTextNode = null;
			this.observer = window.MutationObserver && new window.MutationObserver((mutations) => {
				for (let i = 0; i < mutations.length; i++) this.queue.push(mutations[i]);
				if (ie$1 && ie_version <= 11 && mutations.some((m) => m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length)) this.flushSoon();
				else if (safari && view.composing && mutations.some((m) => m.type == "childList" && m.target.nodeName == "TR")) {
					view.input.badSafariComposition = true;
					this.flushSoon();
				} else this.flush();
			});
			if (useCharData) this.onCharData = (e) => {
				this.queue.push({
					target: e.target,
					type: "characterData",
					oldValue: e.prevValue
				});
				this.flushSoon();
			};
			this.onSelectionChange = this.onSelectionChange.bind(this);
		}
		flushSoon() {
			if (this.flushingSoon < 0) this.flushingSoon = window.setTimeout(() => {
				this.flushingSoon = -1;
				this.flush();
			}, 20);
		}
		forceFlush() {
			if (this.flushingSoon > -1) {
				window.clearTimeout(this.flushingSoon);
				this.flushingSoon = -1;
				this.flush();
			}
		}
		start() {
			if (this.observer) {
				this.observer.takeRecords();
				this.observer.observe(this.view.dom, observeOptions);
			}
			if (this.onCharData) this.view.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
			this.connectSelection();
		}
		stop() {
			if (this.observer) {
				let take = this.observer.takeRecords();
				if (take.length) {
					for (let i = 0; i < take.length; i++) this.queue.push(take[i]);
					window.setTimeout(() => this.flush(), 20);
				}
				this.observer.disconnect();
			}
			if (this.onCharData) this.view.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
			this.disconnectSelection();
		}
		connectSelection() {
			this.view.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
		}
		disconnectSelection() {
			this.view.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange);
		}
		suppressSelectionUpdates() {
			this.suppressingSelectionUpdates = true;
			setTimeout(() => this.suppressingSelectionUpdates = false, 50);
		}
		onSelectionChange() {
			if (!hasFocusAndSelection(this.view)) return;
			if (this.suppressingSelectionUpdates) return selectionToDOM(this.view);
			if (ie$1 && ie_version <= 11 && !this.view.state.selection.empty) {
				let sel = this.view.domSelectionRange();
				if (sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset)) return this.flushSoon();
			}
			this.flush();
		}
		setCurSelection() {
			this.currentSelection.set(this.view.domSelectionRange());
		}
		ignoreSelectionChange(sel) {
			if (!sel.focusNode) return true;
			let ancestors = /* @__PURE__ */ new Set(), container;
			for (let scan = sel.focusNode; scan; scan = parentNode(scan)) ancestors.add(scan);
			for (let scan = sel.anchorNode; scan; scan = parentNode(scan)) if (ancestors.has(scan)) {
				container = scan;
				break;
			}
			let desc = container && this.view.docView.nearestDesc(container);
			if (desc && desc.ignoreMutation({
				type: "selection",
				target: container.nodeType == 3 ? container.parentNode : container
			})) {
				this.setCurSelection();
				return true;
			}
		}
		pendingRecords() {
			if (this.observer) for (let mut of this.observer.takeRecords()) this.queue.push(mut);
			return this.queue;
		}
		flush() {
			let { view } = this;
			if (!view.docView || this.flushingSoon > -1) return;
			let mutations = this.pendingRecords();
			if (mutations.length) this.queue = [];
			let sel = view.domSelectionRange();
			let newSel = !this.suppressingSelectionUpdates && !this.currentSelection.eq(sel) && hasFocusAndSelection(view) && !this.ignoreSelectionChange(sel);
			let from = -1, to = -1, typeOver = false, added = [];
			if (view.editable) for (let i = 0; i < mutations.length; i++) {
				let result = this.registerMutation(mutations[i], added);
				if (result) {
					from = from < 0 ? result.from : Math.min(result.from, from);
					to = to < 0 ? result.to : Math.max(result.to, to);
					if (result.typeOver) typeOver = true;
				}
			}
			if (added.some((n) => n.nodeName == "BR") && (view.input.lastKeyCode == 8 || view.input.lastKeyCode == 46)) {
				for (let node of added) if (node.nodeName == "BR" && node.parentNode) {
					let after = node.nextSibling;
					while (after && after.nodeType == 1) {
						if (after.contentEditable == "false") {
							node.parentNode.removeChild(node);
							break;
						}
						after = after.firstChild;
					}
				}
			} else if (gecko && added.length) {
				let brs = added.filter((n) => n.nodeName == "BR");
				if (brs.length == 2) {
					let [a, b] = brs;
					if (a.parentNode && a.parentNode.parentNode == b.parentNode) b.remove();
					else a.remove();
				} else {
					let { focusNode } = this.currentSelection;
					for (let br of brs) {
						let parent = br.parentNode;
						if (parent && parent.nodeName == "LI" && (!focusNode || blockParent(view, focusNode) != parent)) br.remove();
					}
				}
			}
			let readSel = null;
			if (from < 0 && newSel && view.input.lastFocus > Date.now() - 200 && Math.max(view.input.lastTouch, view.input.lastClick.time) < Date.now() - 300 && selectionCollapsed(sel) && (readSel = selectionFromDOM(view)) && readSel.eq(Selection.near(view.state.doc.resolve(0), 1))) {
				view.input.lastFocus = 0;
				selectionToDOM(view);
				this.currentSelection.set(sel);
				view.scrollToSelection();
			} else if (from > -1 || newSel) {
				if (from > -1) {
					view.docView.markDirty(from, to);
					checkCSS(view);
				}
				if (view.input.badSafariComposition) {
					view.input.badSafariComposition = false;
					fixUpBadSafariComposition(view, added);
				}
				this.handleDOMChange(from, to, typeOver, added);
				if (view.docView && view.docView.dirty) view.updateState(view.state);
				else if (!this.currentSelection.eq(sel)) selectionToDOM(view);
				this.currentSelection.set(sel);
			}
		}
		registerMutation(mut, added) {
			if (added.indexOf(mut.target) > -1) return null;
			let desc = this.view.docView.nearestDesc(mut.target);
			if (mut.type == "attributes" && (desc == this.view.docView || mut.attributeName == "contenteditable" || mut.attributeName == "style" && !mut.oldValue && !mut.target.getAttribute("style"))) return null;
			if (!desc || desc.ignoreMutation(mut)) return null;
			if (mut.type == "childList") {
				for (let i = 0; i < mut.addedNodes.length; i++) {
					let node = mut.addedNodes[i];
					added.push(node);
					if (node.nodeType == 3) this.lastChangedTextNode = node;
				}
				if (desc.contentDOM && desc.contentDOM != desc.dom && !desc.contentDOM.contains(mut.target)) return {
					from: desc.posBefore,
					to: desc.posAfter
				};
				let prev = mut.previousSibling, next = mut.nextSibling;
				if (ie$1 && ie_version <= 11 && mut.addedNodes.length) for (let i = 0; i < mut.addedNodes.length; i++) {
					let { previousSibling, nextSibling } = mut.addedNodes[i];
					if (!previousSibling || Array.prototype.indexOf.call(mut.addedNodes, previousSibling) < 0) prev = previousSibling;
					if (!nextSibling || Array.prototype.indexOf.call(mut.addedNodes, nextSibling) < 0) next = nextSibling;
				}
				let fromOffset = prev && prev.parentNode == mut.target ? domIndex(prev) + 1 : 0;
				let from = desc.localPosFromDOM(mut.target, fromOffset, -1);
				let toOffset = next && next.parentNode == mut.target ? domIndex(next) : mut.target.childNodes.length;
				return {
					from,
					to: desc.localPosFromDOM(mut.target, toOffset, 1)
				};
			} else if (mut.type == "attributes") return {
				from: desc.posAtStart - desc.border,
				to: desc.posAtEnd + desc.border
			};
			else {
				this.lastChangedTextNode = mut.target;
				return {
					from: desc.posAtStart,
					to: desc.posAtEnd,
					typeOver: mut.target.nodeValue == mut.oldValue
				};
			}
		}
	};
	var cssChecked = /* @__PURE__ */ new WeakMap();
	var cssCheckWarned = false;
	function checkCSS(view) {
		if (cssChecked.has(view)) return;
		cssChecked.set(view, null);
		if ([
			"normal",
			"nowrap",
			"pre-line"
		].indexOf(getComputedStyle(view.dom).whiteSpace) !== -1) {
			view.requiresGeckoHackNode = gecko;
			if (cssCheckWarned) return;
			console["warn"]("ProseMirror expects the CSS white-space property to be set, preferably to 'pre-wrap'. It is recommended to load style/prosemirror.css from the prosemirror-view package.");
			cssCheckWarned = true;
		}
	}
	function rangeToSelectionRange(view, range) {
		let anchorNode = range.startContainer, anchorOffset = range.startOffset;
		let focusNode = range.endContainer, focusOffset = range.endOffset;
		let currentAnchor = view.domAtPos(view.state.selection.anchor);
		if (isEquivalentPosition(currentAnchor.node, currentAnchor.offset, focusNode, focusOffset)) [anchorNode, anchorOffset, focusNode, focusOffset] = [
			focusNode,
			focusOffset,
			anchorNode,
			anchorOffset
		];
		return {
			anchorNode,
			anchorOffset,
			focusNode,
			focusOffset
		};
	}
	function safariShadowSelectionRange(view, selection) {
		if (selection.getComposedRanges) {
			let range = selection.getComposedRanges(view.root)[0];
			if (range) return rangeToSelectionRange(view, range);
		}
		let found;
		function read(event) {
			event.preventDefault();
			event.stopImmediatePropagation();
			found = event.getTargetRanges()[0];
		}
		view.dom.addEventListener("beforeinput", read, true);
		document.execCommand("indent");
		view.dom.removeEventListener("beforeinput", read, true);
		return found ? rangeToSelectionRange(view, found) : null;
	}
	function blockParent(view, node) {
		for (let p = node.parentNode; p && p != view.dom; p = p.parentNode) {
			let desc = view.docView.nearestDesc(p, true);
			if (desc && desc.node.isBlock) return p;
		}
		return null;
	}
	function fixUpBadSafariComposition(view, addedNodes) {
		var _a;
		let { focusNode, focusOffset } = view.domSelectionRange();
		for (let node of addedNodes) if (((_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.nodeName) == "TR") {
			let nextCell = node.nextSibling;
			while (nextCell && nextCell.nodeName != "TD" && nextCell.nodeName != "TH") nextCell = nextCell.nextSibling;
			if (nextCell) {
				let parent = nextCell;
				for (;;) {
					let first = parent.firstChild;
					if (!first || first.nodeType != 1 || first.contentEditable == "false" || /^(BR|IMG)$/.test(first.nodeName)) break;
					parent = first;
				}
				parent.insertBefore(node, parent.firstChild);
				if (focusNode == node) view.domSelection().collapse(node, focusOffset);
			} else node.parentNode.removeChild(node);
		}
	}
	function parseBetween(view, from_, to_) {
		let { node: parent, fromOffset, toOffset, from, to } = view.docView.parseRange(from_, to_);
		let domSel = view.domSelectionRange();
		let find;
		let anchor = domSel.anchorNode;
		if (anchor && view.dom.contains(anchor.nodeType == 1 ? anchor : anchor.parentNode)) {
			find = [{
				node: anchor,
				offset: domSel.anchorOffset
			}];
			if (!selectionCollapsed(domSel)) find.push({
				node: domSel.focusNode,
				offset: domSel.focusOffset
			});
		}
		if (chrome && view.input.lastKeyCode === 8) for (let off = toOffset; off > fromOffset; off--) {
			let node = parent.childNodes[off - 1], desc = node.pmViewDesc;
			if (node.nodeName == "BR" && !desc) {
				toOffset = off;
				break;
			}
			if (!desc || desc.size) break;
		}
		let startDoc = view.state.doc;
		let parser = view.someProp("domParser") || DOMParser.fromSchema(view.state.schema);
		let $from = startDoc.resolve(from);
		let sel = null, doc = parser.parse(parent, {
			topNode: $from.parent,
			topMatch: $from.parent.contentMatchAt($from.index()),
			topOpen: true,
			from: fromOffset,
			to: toOffset,
			preserveWhitespace: $from.parent.type.whitespace == "pre" ? "full" : true,
			findPositions: find,
			ruleFromNode,
			context: $from
		});
		if (find && find[0].pos != null) {
			let anchor = find[0].pos, head = find[1] && find[1].pos;
			if (head == null) head = anchor;
			sel = {
				anchor: anchor + from,
				head: head + from
			};
		}
		return {
			doc,
			sel,
			from,
			to
		};
	}
	function ruleFromNode(dom) {
		let desc = dom.pmViewDesc;
		if (desc) return desc.parseRule();
		else if (dom.nodeName == "BR" && dom.parentNode) {
			if (safari && /^(ul|ol)$/i.test(dom.parentNode.nodeName)) {
				let skip = document.createElement("div");
				skip.appendChild(document.createElement("li"));
				return { skip };
			} else if (dom.parentNode.lastChild == dom || safari && /^(tr|table)$/i.test(dom.parentNode.nodeName)) return { ignore: true };
		} else if (dom.nodeName == "IMG" && dom.getAttribute("mark-placeholder")) return { ignore: true };
		return null;
	}
	var isInline = /^(a|abbr|acronym|b|bd[io]|big|br|button|cite|code|data(list)?|del|dfn|em|i|img|ins|kbd|label|map|mark|meter|output|q|ruby|s|samp|small|span|strong|su[bp]|time|u|tt|var)$/i;
	function readDOMChange(view, from, to, typeOver, addedNodes) {
		let compositionID = view.input.compositionPendingChanges || (view.composing ? view.input.compositionID : 0);
		view.input.compositionPendingChanges = 0;
		if (from < 0) {
			let origin = view.input.lastSelectionTime > Date.now() - 50 ? view.input.lastSelectionOrigin : null;
			let newSel = selectionFromDOM(view, origin);
			if (newSel && !view.state.selection.eq(newSel)) {
				if (chrome && android && view.input.lastKeyCode === 13 && Date.now() - 100 < view.input.lastKeyCodeTime && view.someProp("handleKeyDown", (f) => f(view, keyEvent(13, "Enter")))) return;
				let tr = view.state.tr.setSelection(newSel);
				if (origin == "pointer") tr.setMeta("pointer", true);
				else if (origin == "key") tr.scrollIntoView();
				if (compositionID) tr.setMeta("composition", compositionID);
				view.dispatch(tr);
			}
			return;
		}
		let $before = view.state.doc.resolve(from);
		let shared = $before.sharedDepth(to);
		from = $before.before(shared + 1);
		to = view.state.doc.resolve(to).after(shared + 1);
		let sel = view.state.selection;
		let parse = parseBetween(view, from, to);
		let doc = view.state.doc, compare = doc.slice(parse.from, parse.to);
		let preferredPos, preferredSide;
		if (view.input.lastKeyCode === 8 && Date.now() - 100 < view.input.lastKeyCodeTime) {
			preferredPos = view.state.selection.to;
			preferredSide = "end";
		} else {
			preferredPos = view.state.selection.from;
			preferredSide = "start";
		}
		view.input.lastKeyCode = null;
		let change = findDiff(compare.content, parse.doc.content, parse.from, preferredPos, preferredSide);
		if (change) view.input.domChangeCount++;
		if ((ios && view.input.lastIOSEnter > Date.now() - 225 || android) && addedNodes.some((n) => n.nodeType == 1 && !isInline.test(n.nodeName)) && (!change || change.endA >= change.endB) && view.someProp("handleKeyDown", (f) => f(view, keyEvent(13, "Enter")))) {
			view.input.lastIOSEnter = 0;
			return;
		}
		if (!change) if (typeOver && sel instanceof TextSelection && !sel.empty && sel.$head.sameParent(sel.$anchor) && !view.composing && !(parse.sel && parse.sel.anchor != parse.sel.head)) change = {
			start: sel.from,
			endA: sel.to,
			endB: sel.to
		};
		else {
			if (parse.sel) {
				let sel = resolveSelection(view, view.state.doc, parse.sel);
				if (sel && !sel.eq(view.state.selection)) {
					let tr = view.state.tr.setSelection(sel);
					if (compositionID) tr.setMeta("composition", compositionID);
					view.dispatch(tr);
				}
			}
			return;
		}
		if (view.state.selection.from < view.state.selection.to && change.start == change.endB && view.state.selection instanceof TextSelection) {
			if (change.start > view.state.selection.from && change.start <= view.state.selection.from + 2 && view.state.selection.from >= parse.from) change.start = view.state.selection.from;
			else if (change.endA < view.state.selection.to && change.endA >= view.state.selection.to - 2 && view.state.selection.to <= parse.to) {
				change.endB += view.state.selection.to - change.endA;
				change.endA = view.state.selection.to;
			}
		}
		if (ie$1 && ie_version <= 11 && change.endB == change.start + 1 && change.endA == change.start && change.start > parse.from && parse.doc.textBetween(change.start - parse.from - 1, change.start - parse.from + 1) == " \xA0") {
			change.start--;
			change.endA--;
			change.endB--;
		}
		let $from = parse.doc.resolveNoCache(change.start - parse.from);
		let $to = parse.doc.resolveNoCache(change.endB - parse.from);
		let $fromA = doc.resolve(change.start);
		let inlineChange = $from.sameParent($to) && $from.parent.inlineContent && $fromA.end() >= change.endA;
		if ((ios && view.input.lastIOSEnter > Date.now() - 225 && (!inlineChange || addedNodes.some((n) => n.nodeName == "DIV" || n.nodeName == "P")) || !inlineChange && $from.pos < parse.doc.content.size && (!$from.sameParent($to) || !$from.parent.inlineContent) && $from.pos < $to.pos && !/\S/.test(parse.doc.textBetween($from.pos, $to.pos, "", ""))) && view.someProp("handleKeyDown", (f) => f(view, keyEvent(13, "Enter")))) {
			view.input.lastIOSEnter = 0;
			return;
		}
		if (view.state.selection.anchor > change.start && looksLikeBackspace(doc, change.start, change.endA, $from, $to) && view.someProp("handleKeyDown", (f) => f(view, keyEvent(8, "Backspace")))) {
			if (android && chrome) view.domObserver.suppressSelectionUpdates();
			return;
		}
		if (chrome && change.endB == change.start) view.input.lastChromeDelete = Date.now();
		if (android && !inlineChange && $from.start() != $to.start() && $to.parentOffset == 0 && $from.depth == $to.depth && parse.sel && parse.sel.anchor == parse.sel.head && parse.sel.head == change.endA) {
			change.endB -= 2;
			$to = parse.doc.resolveNoCache(change.endB - parse.from);
			setTimeout(() => {
				view.someProp("handleKeyDown", function(f) {
					return f(view, keyEvent(13, "Enter"));
				});
			}, 20);
		}
		let chFrom = change.start, chTo = change.endA;
		let mkTr = (base) => {
			let tr = base || view.state.tr.replace(chFrom, chTo, parse.doc.slice(change.start - parse.from, change.endB - parse.from));
			if (parse.sel) {
				let sel = resolveSelection(view, tr.doc, parse.sel);
				if (sel && !(chrome && view.composing && sel.empty && (change.start != change.endB || view.input.lastChromeDelete < Date.now() - 100) && (sel.head == chFrom || sel.head == tr.mapping.map(chTo) - 1) || ie$1 && sel.empty && sel.head == chFrom)) tr.setSelection(sel);
			}
			if (compositionID) tr.setMeta("composition", compositionID);
			return tr.scrollIntoView();
		};
		let markChange;
		if (inlineChange) if ($from.pos == $to.pos) {
			if (ie$1 && ie_version <= 11 && $from.parentOffset == 0) {
				view.domObserver.suppressSelectionUpdates();
				setTimeout(() => selectionToDOM(view), 20);
			}
			let tr = mkTr(view.state.tr.delete(chFrom, chTo));
			let marks = doc.resolve(change.start).marksAcross(doc.resolve(change.endA));
			if (marks) tr.ensureMarks(marks);
			view.dispatch(tr);
		} else if (change.endA == change.endB && (markChange = isMarkChange($from.parent.content.cut($from.parentOffset, $to.parentOffset), $fromA.parent.content.cut($fromA.parentOffset, change.endA - $fromA.start())))) {
			let tr = mkTr(view.state.tr);
			if (markChange.type == "add") tr.addMark(chFrom, chTo, markChange.mark);
			else tr.removeMark(chFrom, chTo, markChange.mark);
			view.dispatch(tr);
		} else if ($from.parent.child($from.index()).isText && $from.index() == $to.index() - ($to.textOffset ? 0 : 1)) {
			let text = $from.parent.textBetween($from.parentOffset, $to.parentOffset);
			let deflt = () => mkTr(view.state.tr.insertText(text, chFrom, chTo));
			if (!view.someProp("handleTextInput", (f) => f(view, chFrom, chTo, text, deflt))) view.dispatch(deflt());
		} else view.dispatch(mkTr());
		else view.dispatch(mkTr());
	}
	function resolveSelection(view, doc, parsedSel) {
		if (Math.max(parsedSel.anchor, parsedSel.head) > doc.content.size) return null;
		return selectionBetween(view, doc.resolve(parsedSel.anchor), doc.resolve(parsedSel.head));
	}
	function isMarkChange(cur, prev) {
		let curMarks = cur.firstChild.marks, prevMarks = prev.firstChild.marks;
		let added = curMarks, removed = prevMarks, type, mark, update;
		for (let i = 0; i < prevMarks.length; i++) added = prevMarks[i].removeFromSet(added);
		for (let i = 0; i < curMarks.length; i++) removed = curMarks[i].removeFromSet(removed);
		if (added.length == 1 && removed.length == 0) {
			mark = added[0];
			type = "add";
			update = (node) => node.mark(mark.addToSet(node.marks));
		} else if (added.length == 0 && removed.length == 1) {
			mark = removed[0];
			type = "remove";
			update = (node) => node.mark(mark.removeFromSet(node.marks));
		} else return null;
		let updated = [];
		for (let i = 0; i < prev.childCount; i++) updated.push(update(prev.child(i)));
		if (Fragment.from(updated).eq(cur)) return {
			mark,
			type
		};
	}
	function looksLikeBackspace(old, start, end, $newStart, $newEnd) {
		if (end - start <= $newEnd.pos - $newStart.pos || skipClosingAndOpening($newStart, true, false) < $newEnd.pos) return false;
		let $start = old.resolve(start);
		if (!$newStart.parent.isTextblock) {
			let after = $start.nodeAfter;
			return after != null && end == start + after.nodeSize;
		}
		if ($start.parentOffset < $start.parent.content.size || !$start.parent.isTextblock) return false;
		let $next = old.resolve(skipClosingAndOpening($start, true, true));
		if (!$next.parent.isTextblock || $next.pos > end || skipClosingAndOpening($next, true, false) < end) return false;
		return $newStart.parent.content.cut($newStart.parentOffset).eq($next.parent.content);
	}
	function skipClosingAndOpening($pos, fromEnd, mayOpen) {
		let depth = $pos.depth, end = fromEnd ? $pos.end() : $pos.pos;
		while (depth > 0 && (fromEnd || $pos.indexAfter(depth) == $pos.node(depth).childCount)) {
			depth--;
			end++;
			fromEnd = false;
		}
		if (mayOpen) {
			let next = $pos.node(depth).maybeChild($pos.indexAfter(depth));
			while (next && !next.isLeaf) {
				next = next.firstChild;
				end++;
			}
		}
		return end;
	}
	function findDiff(a, b, pos, preferredPos, preferredSide) {
		let start = a.findDiffStart(b, pos);
		if (start == null) return null;
		let { a: endA, b: endB } = a.findDiffEnd(b, pos + a.size, pos + b.size);
		if (preferredSide == "end") {
			let adjust = Math.max(0, start - Math.min(endA, endB));
			preferredPos -= endA + adjust - start;
		}
		if (endA < start && a.size < b.size) {
			let move = preferredPos <= start && preferredPos >= endA ? start - preferredPos : 0;
			start -= move;
			if (start && start < b.size && isSurrogatePair(b.textBetween(start - 1, start + 1))) start += move ? 1 : -1;
			endB = start + (endB - endA);
			endA = start;
		} else if (endB < start) {
			let move = preferredPos <= start && preferredPos >= endB ? start - preferredPos : 0;
			start -= move;
			if (start && start < a.size && isSurrogatePair(a.textBetween(start - 1, start + 1))) start += move ? 1 : -1;
			endA = start + (endA - endB);
			endB = start;
		}
		return {
			start,
			endA,
			endB
		};
	}
	function isSurrogatePair(str) {
		if (str.length != 2) return false;
		let a = str.charCodeAt(0), b = str.charCodeAt(1);
		return a >= 56320 && a <= 57343 && b >= 55296 && b <= 56319;
	}
	/**
	An editor view manages the DOM structure that represents an
	editable document. Its state and behavior are determined by its
	[props](https://prosemirror.net/docs/ref/#view.DirectEditorProps).
	*/
	var EditorView = class {
		/**
		Create a view. `place` may be a DOM node that the editor should
		be appended to, a function that will place it into the document,
		or an object whose `mount` property holds the node to use as the
		document container. If it is `null`, the editor will not be
		added to the document.
		*/
		constructor(place, props) {
			this._root = null;
			/**
			@internal
			*/
			this.focused = false;
			/**
			Kludge used to work around a Chrome bug @internal
			*/
			this.trackWrites = null;
			this.mounted = false;
			/**
			@internal
			*/
			this.markCursor = null;
			/**
			@internal
			*/
			this.cursorWrapper = null;
			/**
			@internal
			*/
			this.lastSelectedViewDesc = void 0;
			/**
			@internal
			*/
			this.input = new InputState();
			this.prevDirectPlugins = [];
			this.pluginViews = [];
			/**
			Holds `true` when a hack node is needed in Firefox to prevent the
			[space is eaten issue](https://code.haverbeke.berlin/prosemirror/prosemirror/issues/651)
			@internal
			*/
			this.requiresGeckoHackNode = false;
			/**
			When editor content is being dragged, this object contains
			information about the dragged slice and whether it is being
			copied or moved. At any other time, it is null.
			*/
			this.dragging = null;
			this._props = props;
			this.state = props.state;
			this.directPlugins = props.plugins || [];
			this.directPlugins.forEach(checkStateComponent);
			this.dispatch = this.dispatch.bind(this);
			this.dom = place && place.mount || document.createElement("div");
			if (place) {
				if (place.appendChild) place.appendChild(this.dom);
				else if (typeof place == "function") place(this.dom);
				else if (place.mount) this.mounted = true;
			}
			this.editable = getEditable(this);
			updateCursorWrapper(this);
			this.nodeViews = buildNodeViews(this);
			this.docView = docViewDesc(this.state.doc, computeDocDeco(this), viewDecorations(this), this.dom, this);
			this.domObserver = new DOMObserver(this, (from, to, typeOver, added) => readDOMChange(this, from, to, typeOver, added));
			this.domObserver.start();
			initInput(this);
			this.updatePluginViews();
		}
		/**
		Holds `true` when a
		[composition](https://w3c.github.io/uievents/#events-compositionevents)
		is active.
		*/
		get composing() {
			return this.input.composing;
		}
		/**
		The view's current [props](https://prosemirror.net/docs/ref/#view.EditorProps).
		*/
		get props() {
			if (this._props.state != this.state) {
				let prev = this._props;
				this._props = {};
				for (let name in prev) this._props[name] = prev[name];
				this._props.state = this.state;
			}
			return this._props;
		}
		/**
		Update the view's props. Will immediately cause an update to
		the DOM.
		*/
		update(props) {
			if (props.handleDOMEvents != this._props.handleDOMEvents) ensureListeners(this);
			let prevProps = this._props;
			this._props = props;
			if (props.plugins) {
				props.plugins.forEach(checkStateComponent);
				this.directPlugins = props.plugins;
			}
			this.updateStateInner(props.state, prevProps);
		}
		/**
		Update the view by updating existing props object with the object
		given as argument. Equivalent to `view.update(Object.assign({},
		view.props, props))`.
		*/
		setProps(props) {
			let updated = {};
			for (let name in this._props) updated[name] = this._props[name];
			updated.state = this.state;
			for (let name in props) updated[name] = props[name];
			this.update(updated);
		}
		/**
		Update the editor's `state` prop, without touching any of the
		other props.
		*/
		updateState(state) {
			this.updateStateInner(state, this._props);
		}
		updateStateInner(state, prevProps) {
			var _a;
			let prev = this.state, redraw = false, updateSel = false;
			if (state.storedMarks && this.composing) {
				clearComposition(this);
				updateSel = true;
			}
			this.state = state;
			let pluginsChanged = prev.plugins != state.plugins || this._props.plugins != prevProps.plugins;
			if (pluginsChanged || this._props.plugins != prevProps.plugins || this._props.nodeViews != prevProps.nodeViews) {
				let nodeViews = buildNodeViews(this);
				if (changedNodeViews(nodeViews, this.nodeViews)) {
					this.nodeViews = nodeViews;
					redraw = true;
				}
			}
			if (pluginsChanged || prevProps.handleDOMEvents != this._props.handleDOMEvents) ensureListeners(this);
			this.editable = getEditable(this);
			updateCursorWrapper(this);
			let innerDeco = viewDecorations(this), outerDeco = computeDocDeco(this);
			let scroll = prev.plugins != state.plugins && !prev.doc.eq(state.doc) ? "reset" : state.scrollToSelection > prev.scrollToSelection ? "to selection" : "preserve";
			let updateDoc = redraw || !this.docView.matchesNode(state.doc, outerDeco, innerDeco);
			if (updateDoc || !state.selection.eq(prev.selection)) updateSel = true;
			let oldScrollPos = scroll == "preserve" && updateSel && this.dom.style.overflowAnchor == null && storeScrollPos(this);
			if (updateSel) {
				this.domObserver.stop();
				let forceSelUpdate = updateDoc && (ie$1 || chrome) && !this.composing && !prev.selection.empty && !state.selection.empty && selectionContextChanged(prev.selection, state.selection);
				if (updateDoc) {
					let chromeKludge = chrome ? this.trackWrites = this.domSelectionRange().focusNode : null;
					if (this.composing) this.input.compositionNode = findCompositionNode(this);
					if (redraw || !this.docView.update(state.doc, outerDeco, innerDeco, this)) {
						this.docView.updateOuterDeco(outerDeco);
						this.docView.destroy();
						this.docView = docViewDesc(state.doc, outerDeco, innerDeco, this.dom, this);
					}
					if (chromeKludge && (!this.trackWrites || !this.dom.contains(this.trackWrites))) forceSelUpdate = true;
				}
				if (forceSelUpdate || !(this.input.mouseDown && this.domObserver.currentSelection.eq(this.domSelectionRange()) && anchorInRightPlace(this))) selectionToDOM(this, forceSelUpdate);
				else {
					syncNodeSelection(this, state.selection);
					this.domObserver.setCurSelection();
				}
				this.domObserver.start();
			}
			this.updatePluginViews(prev);
			if (((_a = this.dragging) === null || _a === void 0 ? void 0 : _a.node) && !prev.doc.eq(state.doc)) this.updateDraggedNode(this.dragging, prev);
			if (scroll == "reset") this.dom.scrollTop = 0;
			else if (scroll == "to selection") this.scrollToSelection();
			else if (oldScrollPos) resetScrollPos(oldScrollPos);
		}
		/**
		@internal
		*/
		scrollToSelection() {
			let startDOM = this.domSelectionRange().focusNode;
			if (!startDOM || !this.dom.contains(startDOM.nodeType == 1 ? startDOM : startDOM.parentNode));
			else if (this.someProp("handleScrollToSelection", (f) => f(this)));
			else if (this.state.selection instanceof NodeSelection) {
				let target = this.docView.domAfterPos(this.state.selection.from);
				if (target.nodeType == 1) scrollRectIntoView(this, target.getBoundingClientRect(), startDOM);
			} else scrollRectIntoView(this, this.coordsAtPos(this.state.selection.head, 1), startDOM);
		}
		destroyPluginViews() {
			let view;
			while (view = this.pluginViews.pop()) if (view.destroy) view.destroy();
		}
		updatePluginViews(prevState) {
			if (!prevState || prevState.plugins != this.state.plugins || this.directPlugins != this.prevDirectPlugins) {
				this.prevDirectPlugins = this.directPlugins;
				this.destroyPluginViews();
				for (let i = 0; i < this.directPlugins.length; i++) {
					let plugin = this.directPlugins[i];
					if (plugin.spec.view) this.pluginViews.push(plugin.spec.view(this));
				}
				for (let i = 0; i < this.state.plugins.length; i++) {
					let plugin = this.state.plugins[i];
					if (plugin.spec.view) this.pluginViews.push(plugin.spec.view(this));
				}
			} else for (let i = 0; i < this.pluginViews.length; i++) {
				let pluginView = this.pluginViews[i];
				if (pluginView.update) pluginView.update(this, prevState);
			}
		}
		updateDraggedNode(dragging, prev) {
			let sel = dragging.node, found = -1;
			if (sel.from < this.state.doc.content.size && this.state.doc.nodeAt(sel.from) == sel.node) found = sel.from;
			else {
				let movedPos = sel.from + (this.state.doc.content.size - prev.doc.content.size);
				if ((movedPos > 0 && movedPos < this.state.doc.content.size && this.state.doc.nodeAt(movedPos)) == sel.node) found = movedPos;
			}
			this.dragging = new Dragging(dragging.slice, dragging.move, found < 0 ? void 0 : NodeSelection.create(this.state.doc, found));
		}
		someProp(propName, f) {
			let prop = this._props && this._props[propName], value;
			if (prop != null && (value = f ? f(prop) : prop)) return value;
			for (let i = 0; i < this.directPlugins.length; i++) {
				let prop = this.directPlugins[i].props[propName];
				if (prop != null && (value = f ? f(prop) : prop)) return value;
			}
			let plugins = this.state.plugins;
			if (plugins) for (let i = 0; i < plugins.length; i++) {
				let prop = plugins[i].props[propName];
				if (prop != null && (value = f ? f(prop) : prop)) return value;
			}
		}
		/**
		Query whether the view has focus.
		*/
		hasFocus() {
			if (ie$1) {
				let node = this.root.activeElement;
				if (node == this.dom) return true;
				if (!node || !this.dom.contains(node)) return false;
				while (node && this.dom != node && this.dom.contains(node)) {
					if (node.contentEditable == "false") return false;
					node = node.parentElement;
				}
				return true;
			}
			return this.root.activeElement == this.dom;
		}
		/**
		Focus the editor.
		*/
		focus() {
			this.domObserver.stop();
			if (this.editable) focusPreventScroll(this.dom);
			selectionToDOM(this);
			this.domObserver.start();
		}
		/**
		Get the document root in which the editor exists. This will
		usually be the top-level `document`, but might be a [shadow
		DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Shadow_DOM)
		root if the editor is inside one.
		*/
		get root() {
			let cached = this._root;
			if (cached == null) {
				for (let search = this.dom.parentNode; search; search = search.parentNode) if (search.nodeType == 9 || search.nodeType == 11 && search.host) {
					if (!search.getSelection) Object.getPrototypeOf(search).getSelection = () => search.ownerDocument.getSelection();
					return this._root = search;
				}
			}
			return cached || document;
		}
		/**
		When an existing editor view is moved to a new document or
		shadow tree, call this to make it recompute its root.
		*/
		updateRoot() {
			this._root = null;
		}
		/**
		Given a pair of viewport coordinates, return the document
		position that corresponds to them. May return null if the given
		coordinates aren't inside of the editor. When an object is
		returned, its `pos` property is the position nearest to the
		coordinates, and its `inside` property holds the position of the
		inner node that the position falls inside of, or -1 if it is at
		the top level, not in any node.
		*/
		posAtCoords(coords) {
			return posAtCoords(this, coords);
		}
		/**
		Returns the viewport rectangle at a given document position.
		`left` and `right` will be the same number, as this returns a
		flat cursor-ish rectangle. If the position is between two things
		that aren't directly adjacent, `side` determines which element
		is used. When < 0, the element before the position is used,
		otherwise the element after.
		*/
		coordsAtPos(pos, side = 1) {
			return coordsAtPos(this, pos, side);
		}
		/**
		Find the DOM position that corresponds to the given document
		position. When `side` is negative, find the position as close as
		possible to the content before the position. When positive,
		prefer positions close to the content after the position. When
		zero, prefer as shallow a position as possible.
		
		Note that you should **not** mutate the editor's internal DOM,
		only inspect it (and even that is usually not necessary).
		*/
		domAtPos(pos, side = 0) {
			return this.docView.domFromPos(pos, side);
		}
		/**
		Find the DOM node that represents the document node after the
		given position. May return `null` when the position doesn't point
		in front of a node or if the node is inside an opaque node view.
		
		This is intended to be able to call things like
		`getBoundingClientRect` on that DOM node. Do **not** mutate the
		editor DOM directly, or add styling this way, since that will be
		immediately overriden by the editor as it redraws the node.
		*/
		nodeDOM(pos) {
			let desc = this.docView.descAt(pos);
			return desc ? desc.nodeDOM : null;
		}
		/**
		Find the document position that corresponds to a given DOM
		position. (Whenever possible, it is preferable to inspect the
		document structure directly, rather than poking around in the
		DOM, but sometimes—for example when interpreting an event
		target—you don't have a choice.)
		
		The `bias` parameter can be used to influence which side of a DOM
		node to use when the position is inside a leaf node.
		*/
		posAtDOM(node, offset, bias = -1) {
			let pos = this.docView.posFromDOM(node, offset, bias);
			if (pos == null) throw new RangeError("DOM position not inside the editor");
			return pos;
		}
		/**
		Find out whether the selection is at the end of a textblock when
		moving in a given direction. When, for example, given `"left"`,
		it will return true if moving left from the current cursor
		position would leave that position's parent textblock. Will apply
		to the view's current state by default, but it is possible to
		pass a different state.
		*/
		endOfTextblock(dir, state) {
			return endOfTextblock(this, state || this.state, dir);
		}
		/**
		Run the editor's paste logic with the given HTML string. The
		`event`, if given, will be passed to the
		[`handlePaste`](https://prosemirror.net/docs/ref/#view.EditorProps.handlePaste) hook.
		*/
		pasteHTML(html, event) {
			return doPaste(this, "", html, false, event || new ClipboardEvent("paste"));
		}
		/**
		Run the editor's paste logic with the given plain-text input.
		*/
		pasteText(text, event) {
			return doPaste(this, text, null, true, event || new ClipboardEvent("paste"));
		}
		/**
		Serialize the given slice as it would be if it was copied from
		this editor. Returns a DOM element that contains a
		representation of the slice as its children, a textual
		representation, and the transformed slice (which can be
		different from the given input due to hooks like
		[`transformCopied`](https://prosemirror.net/docs/ref/#view.EditorProps.transformCopied)).
		*/
		serializeForClipboard(slice) {
			return serializeForClipboard(this, slice);
		}
		/**
		Removes the editor from the DOM and destroys all [node
		views](https://prosemirror.net/docs/ref/#view.NodeView).
		*/
		destroy() {
			if (!this.docView) return;
			destroyInput(this);
			this.destroyPluginViews();
			if (this.mounted) {
				this.docView.update(this.state.doc, [], viewDecorations(this), this);
				this.dom.textContent = "";
			} else if (this.dom.parentNode) this.dom.parentNode.removeChild(this.dom);
			this.docView.destroy();
			this.docView = null;
			clearReusedRange();
		}
		/**
		This is true when the view has been
		[destroyed](https://prosemirror.net/docs/ref/#view.EditorView.destroy) (and thus should not be
		used anymore).
		*/
		get isDestroyed() {
			return this.docView == null;
		}
		/**
		Used for testing.
		*/
		dispatchEvent(event) {
			return dispatchEvent(this, event);
		}
		/**
		@internal
		*/
		domSelectionRange() {
			let sel = this.domSelection();
			if (!sel) return {
				focusNode: null,
				focusOffset: 0,
				anchorNode: null,
				anchorOffset: 0
			};
			return safari && this.root.nodeType === 11 && deepActiveElement(this.dom.ownerDocument) == this.dom && safariShadowSelectionRange(this, sel) || sel;
		}
		/**
		@internal
		*/
		domSelection() {
			return this.root.getSelection();
		}
	};
	EditorView.prototype.dispatch = function(tr) {
		let dispatchTransaction = this._props.dispatchTransaction;
		if (dispatchTransaction) dispatchTransaction.call(this, tr);
		else this.updateState(this.state.apply(tr));
	};
	function computeDocDeco(view) {
		let attrs = Object.create(null);
		attrs.class = "ProseMirror";
		attrs.contenteditable = String(view.editable);
		view.someProp("attributes", (value) => {
			if (typeof value == "function") value = value(view.state);
			if (value) {
				for (let attr in value) if (attr == "class") attrs.class += " " + value[attr];
				else if (attr == "style") attrs.style = (attrs.style ? attrs.style + ";" : "") + value[attr];
				else if (!attrs[attr] && attr != "contenteditable" && attr != "nodeName") attrs[attr] = String(value[attr]);
			}
		});
		if (!attrs.translate) attrs.translate = "no";
		return [Decoration.node(0, view.state.doc.content.size, attrs)];
	}
	function updateCursorWrapper(view) {
		if (view.markCursor) {
			let dom = document.createElement("img");
			dom.className = "ProseMirror-separator";
			dom.setAttribute("mark-placeholder", "true");
			dom.setAttribute("alt", "");
			view.cursorWrapper = {
				dom,
				deco: Decoration.widget(view.state.selection.from, dom, {
					raw: true,
					marks: view.markCursor
				})
			};
		} else view.cursorWrapper = null;
	}
	function getEditable(view) {
		return !view.someProp("editable", (value) => value(view.state) === false);
	}
	function selectionContextChanged(sel1, sel2) {
		let depth = Math.min(sel1.$anchor.sharedDepth(sel1.head), sel2.$anchor.sharedDepth(sel2.head));
		return sel1.$anchor.start(depth) != sel2.$anchor.start(depth);
	}
	function buildNodeViews(view) {
		let result = Object.create(null);
		function add(obj) {
			for (let prop in obj) if (!Object.prototype.hasOwnProperty.call(result, prop)) result[prop] = obj[prop];
		}
		view.someProp("nodeViews", add);
		view.someProp("markViews", add);
		return result;
	}
	function changedNodeViews(a, b) {
		let nA = 0, nB = 0;
		for (let prop in a) {
			if (a[prop] != b[prop]) return true;
			nA++;
		}
		for (let _ in b) nB++;
		return nA != nB;
	}
	function checkStateComponent(plugin) {
		if (plugin.spec.state || plugin.spec.filterTransaction || plugin.spec.appendTransaction) throw new RangeError("Plugins passed directly to the view must not have a state component");
	}
	//#endregion
	//#region node_modules/w3c-keyname/index.js
	var base = {
		8: "Backspace",
		9: "Tab",
		10: "Enter",
		12: "NumLock",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		44: "PrintScreen",
		45: "Insert",
		46: "Delete",
		59: ";",
		61: "=",
		91: "Meta",
		92: "Meta",
		106: "*",
		107: "+",
		108: ",",
		109: "-",
		110: ".",
		111: "/",
		144: "NumLock",
		145: "ScrollLock",
		160: "Shift",
		161: "Shift",
		162: "Control",
		163: "Control",
		164: "Alt",
		165: "Alt",
		173: "-",
		186: ";",
		187: "=",
		188: ",",
		189: "-",
		190: ".",
		191: "/",
		192: "`",
		219: "[",
		220: "\\",
		221: "]",
		222: "'"
	};
	var shift = {
		48: ")",
		49: "!",
		50: "@",
		51: "#",
		52: "$",
		53: "%",
		54: "^",
		55: "&",
		56: "*",
		57: "(",
		59: ":",
		61: "+",
		173: "_",
		186: ":",
		187: "+",
		188: "<",
		189: "_",
		190: ">",
		191: "?",
		192: "~",
		219: "{",
		220: "|",
		221: "}",
		222: "\""
	};
	var mac$1 = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
	var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
	for (var i = 0; i < 10; i++) base[48 + i] = base[96 + i] = String(i);
	for (var i = 1; i <= 24; i++) base[i + 111] = "F" + i;
	for (var i = 65; i <= 90; i++) {
		base[i] = String.fromCharCode(i + 32);
		shift[i] = String.fromCharCode(i);
	}
	for (var code$3 in base) if (!shift.hasOwnProperty(code$3)) shift[code$3] = base[code$3];
	function keyName(event) {
		var name = !(mac$1 && event.metaKey && event.shiftKey && !event.ctrlKey && !event.altKey || ie && event.shiftKey && event.key && event.key.length == 1 || event.key == "Unidentified") && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
		if (name == "Esc") name = "Escape";
		if (name == "Del") name = "Delete";
		if (name == "Left") name = "ArrowLeft";
		if (name == "Up") name = "ArrowUp";
		if (name == "Right") name = "ArrowRight";
		if (name == "Down") name = "ArrowDown";
		return name;
	}
	//#endregion
	//#region node_modules/prosemirror-keymap/dist/index.js
	var mac = typeof navigator != "undefined" && /Mac|iP(hone|[oa]d)/.test(navigator.platform);
	var windows = typeof navigator != "undefined" && /Win/.test(navigator.platform);
	function normalizeKeyName(name) {
		let parts = name.split(/-(?!$)/), result = parts[parts.length - 1];
		if (result == "Space") result = " ";
		let alt, ctrl, shift, meta;
		for (let i = 0; i < parts.length - 1; i++) {
			let mod = parts[i];
			if (/^(cmd|meta|m)$/i.test(mod)) meta = true;
			else if (/^a(lt)?$/i.test(mod)) alt = true;
			else if (/^(c|ctrl|control)$/i.test(mod)) ctrl = true;
			else if (/^s(hift)?$/i.test(mod)) shift = true;
			else if (/^mod$/i.test(mod)) if (mac) meta = true;
			else ctrl = true;
			else throw new Error("Unrecognized modifier name: " + mod);
		}
		if (alt) result = "Alt-" + result;
		if (ctrl) result = "Ctrl-" + result;
		if (meta) result = "Meta-" + result;
		if (shift) result = "Shift-" + result;
		return result;
	}
	function normalize$1(map) {
		let copy = Object.create(null);
		for (let prop in map) copy[normalizeKeyName(prop)] = map[prop];
		return copy;
	}
	function modifiers(name, event, shift = true) {
		if (event.altKey) name = "Alt-" + name;
		if (event.ctrlKey) name = "Ctrl-" + name;
		if (event.metaKey) name = "Meta-" + name;
		if (shift && event.shiftKey) name = "Shift-" + name;
		return name;
	}
	/**
	Create a keymap plugin for the given set of bindings.
	
	Bindings should map key names to [command](https://prosemirror.net/docs/ref/#commands)-style
	functions, which will be called with `(EditorState, dispatch,
	EditorView)` arguments, and should return true when they've handled
	the key. Note that the view argument isn't part of the command
	protocol, but can be used as an escape hatch if a binding needs to
	directly interact with the UI.
	
	Key names may be strings like `"Shift-Ctrl-Enter"`—a key
	identifier prefixed with zero or more modifiers. Key identifiers
	are based on the strings that can appear in
	[`KeyEvent.key`](https:developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key).
	Use lowercase letters to refer to letter keys (or uppercase letters
	if you want shift to be held). You may use `"Space"` as an alias
	for the `" "` name.
	
	Modifiers can be given in any order. `Shift-` (or `s-`), `Alt-` (or
	`a-`), `Ctrl-` (or `c-` or `Control-`) and `Cmd-` (or `m-` or
	`Meta-`) are recognized. For characters that are created by holding
	shift, the `Shift-` prefix is implied, and should not be added
	explicitly.
	
	You can use `Mod-` as a shorthand for `Cmd-` on Mac and `Ctrl-` on
	other platforms.
	
	You can add multiple keymap plugins to an editor. The order in
	which they appear determines their precedence (the ones early in
	the array get to dispatch first).
	*/
	function keymap(bindings) {
		return new Plugin({ props: { handleKeyDown: keydownHandler(bindings) } });
	}
	/**
	Given a set of bindings (using the same format as
	[`keymap`](https://prosemirror.net/docs/ref/#keymap.keymap)), return a [keydown
	handler](https://prosemirror.net/docs/ref/#view.EditorProps.handleKeyDown) that handles them.
	*/
	function keydownHandler(bindings) {
		let map = normalize$1(bindings);
		return function(view, event) {
			let name = keyName(event), baseName, direct = map[modifiers(name, event)];
			if (direct && direct(view.state, view.dispatch, view)) return true;
			if (name.length == 1 && name != " ") {
				if (event.shiftKey) {
					let noShift = map[modifiers(name, event, false)];
					if (noShift && noShift(view.state, view.dispatch, view)) return true;
				}
				if ((event.altKey || event.metaKey || event.ctrlKey) && !(windows && event.ctrlKey && event.altKey) && (baseName = base[event.keyCode]) && baseName != name) {
					let fromCode = map[modifiers(baseName, event)];
					if (fromCode && fromCode(view.state, view.dispatch, view)) return true;
				}
			}
			return false;
		};
	}
	//#endregion
	//#region node_modules/rope-sequence/dist/index.js
	var GOOD_LEAF_SIZE = 200;
	var RopeSequence = function RopeSequence() {};
	RopeSequence.prototype.append = function append(other) {
		if (!other.length) return this;
		other = RopeSequence.from(other);
		return !this.length && other || other.length < GOOD_LEAF_SIZE && this.leafAppend(other) || this.length < GOOD_LEAF_SIZE && other.leafPrepend(this) || this.appendInner(other);
	};
	RopeSequence.prototype.prepend = function prepend(other) {
		if (!other.length) return this;
		return RopeSequence.from(other).append(this);
	};
	RopeSequence.prototype.appendInner = function appendInner(other) {
		return new Append(this, other);
	};
	RopeSequence.prototype.slice = function slice(from, to) {
		if (from === void 0) from = 0;
		if (to === void 0) to = this.length;
		if (from >= to) return RopeSequence.empty;
		return this.sliceInner(Math.max(0, from), Math.min(this.length, to));
	};
	RopeSequence.prototype.get = function get(i) {
		if (i < 0 || i >= this.length) return;
		return this.getInner(i);
	};
	RopeSequence.prototype.forEach = function forEach(f, from, to) {
		if (from === void 0) from = 0;
		if (to === void 0) to = this.length;
		if (from <= to) this.forEachInner(f, from, to, 0);
		else this.forEachInvertedInner(f, from, to, 0);
	};
	RopeSequence.prototype.map = function map(f, from, to) {
		if (from === void 0) from = 0;
		if (to === void 0) to = this.length;
		var result = [];
		this.forEach(function(elt, i) {
			return result.push(f(elt, i));
		}, from, to);
		return result;
	};
	RopeSequence.from = function from(values) {
		if (values instanceof RopeSequence) return values;
		return values && values.length ? new Leaf(values) : RopeSequence.empty;
	};
	var Leaf = /* @__PURE__ */ function(RopeSequence) {
		function Leaf(values) {
			RopeSequence.call(this);
			this.values = values;
		}
		if (RopeSequence) Leaf.__proto__ = RopeSequence;
		Leaf.prototype = Object.create(RopeSequence && RopeSequence.prototype);
		Leaf.prototype.constructor = Leaf;
		var prototypeAccessors = {
			length: { configurable: true },
			depth: { configurable: true }
		};
		Leaf.prototype.flatten = function flatten() {
			return this.values;
		};
		Leaf.prototype.sliceInner = function sliceInner(from, to) {
			if (from == 0 && to == this.length) return this;
			return new Leaf(this.values.slice(from, to));
		};
		Leaf.prototype.getInner = function getInner(i) {
			return this.values[i];
		};
		Leaf.prototype.forEachInner = function forEachInner(f, from, to, start) {
			for (var i = from; i < to; i++) if (f(this.values[i], start + i) === false) return false;
		};
		Leaf.prototype.forEachInvertedInner = function forEachInvertedInner(f, from, to, start) {
			for (var i = from - 1; i >= to; i--) if (f(this.values[i], start + i) === false) return false;
		};
		Leaf.prototype.leafAppend = function leafAppend(other) {
			if (this.length + other.length <= GOOD_LEAF_SIZE) return new Leaf(this.values.concat(other.flatten()));
		};
		Leaf.prototype.leafPrepend = function leafPrepend(other) {
			if (this.length + other.length <= GOOD_LEAF_SIZE) return new Leaf(other.flatten().concat(this.values));
		};
		prototypeAccessors.length.get = function() {
			return this.values.length;
		};
		prototypeAccessors.depth.get = function() {
			return 0;
		};
		Object.defineProperties(Leaf.prototype, prototypeAccessors);
		return Leaf;
	}(RopeSequence);
	RopeSequence.empty = new Leaf([]);
	var Append = /* @__PURE__ */ function(RopeSequence) {
		function Append(left, right) {
			RopeSequence.call(this);
			this.left = left;
			this.right = right;
			this.length = left.length + right.length;
			this.depth = Math.max(left.depth, right.depth) + 1;
		}
		if (RopeSequence) Append.__proto__ = RopeSequence;
		Append.prototype = Object.create(RopeSequence && RopeSequence.prototype);
		Append.prototype.constructor = Append;
		Append.prototype.flatten = function flatten() {
			return this.left.flatten().concat(this.right.flatten());
		};
		Append.prototype.getInner = function getInner(i) {
			return i < this.left.length ? this.left.get(i) : this.right.get(i - this.left.length);
		};
		Append.prototype.forEachInner = function forEachInner(f, from, to, start) {
			var leftLen = this.left.length;
			if (from < leftLen && this.left.forEachInner(f, from, Math.min(to, leftLen), start) === false) return false;
			if (to > leftLen && this.right.forEachInner(f, Math.max(from - leftLen, 0), Math.min(this.length, to) - leftLen, start + leftLen) === false) return false;
		};
		Append.prototype.forEachInvertedInner = function forEachInvertedInner(f, from, to, start) {
			var leftLen = this.left.length;
			if (from > leftLen && this.right.forEachInvertedInner(f, from - leftLen, Math.max(to, leftLen) - leftLen, start + leftLen) === false) return false;
			if (to < leftLen && this.left.forEachInvertedInner(f, Math.min(from, leftLen), to, start) === false) return false;
		};
		Append.prototype.sliceInner = function sliceInner(from, to) {
			if (from == 0 && to == this.length) return this;
			var leftLen = this.left.length;
			if (to <= leftLen) return this.left.slice(from, to);
			if (from >= leftLen) return this.right.slice(from - leftLen, to - leftLen);
			return this.left.slice(from, leftLen).append(this.right.slice(0, to - leftLen));
		};
		Append.prototype.leafAppend = function leafAppend(other) {
			var inner = this.right.leafAppend(other);
			if (inner) return new Append(this.left, inner);
		};
		Append.prototype.leafPrepend = function leafPrepend(other) {
			var inner = this.left.leafPrepend(other);
			if (inner) return new Append(inner, this.right);
		};
		Append.prototype.appendInner = function appendInner(other) {
			if (this.left.depth >= Math.max(this.right.depth, other.depth) + 1) return new Append(this.left, new Append(this.right, other));
			return new Append(this, other);
		};
		return Append;
	}(RopeSequence);
	//#endregion
	//#region node_modules/prosemirror-history/dist/index.js
	var max_empty_items = 500;
	var Branch = class Branch {
		constructor(items, eventCount) {
			this.items = items;
			this.eventCount = eventCount;
		}
		popEvent(state, preserveItems) {
			if (this.eventCount == 0) return null;
			let end = this.items.length;
			for (;; end--) if (this.items.get(end - 1).selection) {
				--end;
				break;
			}
			let remap, mapFrom;
			if (preserveItems) {
				remap = this.remapping(end, this.items.length);
				mapFrom = remap.maps.length;
			}
			let transform = state.tr;
			let selection, remaining;
			let addAfter = [], addBefore = [];
			this.items.forEach((item, i) => {
				if (!item.step) {
					if (!remap) {
						remap = this.remapping(end, i + 1);
						mapFrom = remap.maps.length;
					}
					mapFrom--;
					addBefore.push(item);
					return;
				}
				if (remap) {
					addBefore.push(new Item(item.map));
					let step = item.step.map(remap.slice(mapFrom)), map;
					if (step && transform.maybeStep(step).doc) {
						map = transform.mapping.maps[transform.mapping.maps.length - 1];
						addAfter.push(new Item(map, void 0, void 0, addAfter.length + addBefore.length));
					}
					mapFrom--;
					if (map) remap.appendMap(map, mapFrom);
				} else transform.maybeStep(item.step);
				if (item.selection) {
					selection = remap ? item.selection.map(remap.slice(mapFrom)) : item.selection;
					remaining = new Branch(this.items.slice(0, end).append(addBefore.reverse().concat(addAfter)), this.eventCount - 1);
					return false;
				}
			}, this.items.length, 0);
			return {
				remaining,
				transform,
				selection
			};
		}
		addTransform(transform, selection, histOptions, preserveItems) {
			let newItems = [], eventCount = this.eventCount;
			let oldItems = this.items, lastItem = !preserveItems && oldItems.length ? oldItems.get(oldItems.length - 1) : null;
			for (let i = 0; i < transform.steps.length; i++) {
				let step = transform.steps[i].invert(transform.docs[i]);
				let item = new Item(transform.mapping.maps[i], step, selection), merged;
				if (merged = lastItem && lastItem.merge(item)) {
					item = merged;
					if (i) newItems.pop();
					else oldItems = oldItems.slice(0, oldItems.length - 1);
				}
				newItems.push(item);
				if (selection) {
					eventCount++;
					selection = void 0;
				}
				if (!preserveItems) lastItem = item;
			}
			let overflow = eventCount - histOptions.depth;
			if (overflow > DEPTH_OVERFLOW) {
				oldItems = cutOffEvents(oldItems, overflow);
				eventCount -= overflow;
			}
			return new Branch(oldItems.append(newItems), eventCount);
		}
		remapping(from, to) {
			let maps = new Mapping();
			this.items.forEach((item, i) => {
				let mirrorPos = item.mirrorOffset != null && i - item.mirrorOffset >= from ? maps.maps.length - item.mirrorOffset : void 0;
				maps.appendMap(item.map, mirrorPos);
			}, from, to);
			return maps;
		}
		addMaps(array) {
			if (this.eventCount == 0) return this;
			return new Branch(this.items.append(array.map((map) => new Item(map))), this.eventCount);
		}
		rebased(rebasedTransform, rebasedCount) {
			if (!this.eventCount) return this;
			let rebasedItems = [], start = Math.max(0, this.items.length - rebasedCount);
			let mapping = rebasedTransform.mapping;
			let newUntil = rebasedTransform.steps.length;
			let eventCount = this.eventCount;
			this.items.forEach((item) => {
				if (item.selection) eventCount--;
			}, start);
			let iRebased = rebasedCount;
			this.items.forEach((item) => {
				let pos = mapping.getMirror(--iRebased);
				if (pos == null) return;
				newUntil = Math.min(newUntil, pos);
				let map = mapping.maps[pos];
				if (item.step) {
					let step = rebasedTransform.steps[pos].invert(rebasedTransform.docs[pos]);
					let selection = item.selection && item.selection.map(mapping.slice(iRebased + 1, pos));
					if (selection) eventCount++;
					rebasedItems.push(new Item(map, step, selection));
				} else rebasedItems.push(new Item(map));
			}, start);
			let newMaps = [];
			for (let i = rebasedCount; i < newUntil; i++) newMaps.push(new Item(mapping.maps[i]));
			let branch = new Branch(this.items.slice(0, start).append(newMaps).append(rebasedItems), eventCount);
			if (branch.emptyItemCount() > max_empty_items) branch = branch.compress(this.items.length - rebasedItems.length);
			return branch;
		}
		emptyItemCount() {
			let count = 0;
			this.items.forEach((item) => {
				if (!item.step) count++;
			});
			return count;
		}
		compress(upto = this.items.length) {
			let remap = this.remapping(0, upto), mapFrom = remap.maps.length;
			let items = [], events = 0;
			this.items.forEach((item, i) => {
				if (i >= upto) {
					items.push(item);
					if (item.selection) events++;
				} else if (item.step) {
					let step = item.step.map(remap.slice(mapFrom)), map = step && step.getMap();
					mapFrom--;
					if (map) remap.appendMap(map, mapFrom);
					if (step) {
						let selection = item.selection && item.selection.map(remap.slice(mapFrom));
						if (selection) events++;
						let newItem = new Item(map.invert(), step, selection), merged, last = items.length - 1;
						if (merged = items.length && items[last].merge(newItem)) items[last] = merged;
						else items.push(newItem);
					}
				} else if (item.map) mapFrom--;
			}, this.items.length, 0);
			return new Branch(RopeSequence.from(items.reverse()), events);
		}
	};
	Branch.empty = new Branch(RopeSequence.empty, 0);
	function cutOffEvents(items, n) {
		let cutPoint;
		items.forEach((item, i) => {
			if (item.selection && n-- == 0) {
				cutPoint = i;
				return false;
			}
		});
		return items.slice(cutPoint);
	}
	var Item = class Item {
		constructor(map, step, selection, mirrorOffset) {
			this.map = map;
			this.step = step;
			this.selection = selection;
			this.mirrorOffset = mirrorOffset;
		}
		merge(other) {
			if (this.step && other.step && !other.selection) {
				let step = other.step.merge(this.step);
				if (step) return new Item(step.getMap().invert(), step, this.selection);
			}
		}
	};
	var HistoryState = class {
		constructor(done, undone, prevRanges, prevTime, prevComposition) {
			this.done = done;
			this.undone = undone;
			this.prevRanges = prevRanges;
			this.prevTime = prevTime;
			this.prevComposition = prevComposition;
		}
	};
	var DEPTH_OVERFLOW = 20;
	function applyTransaction(history, state, tr, options) {
		let historyTr = tr.getMeta(historyKey), rebased;
		if (historyTr) return historyTr.historyState;
		if (tr.getMeta(closeHistoryKey)) history = new HistoryState(history.done, history.undone, null, 0, -1);
		let appended = tr.getMeta("appendedTransaction");
		if (tr.steps.length == 0) return history;
		else if (appended && appended.getMeta(historyKey)) if (appended.getMeta(historyKey).redo) return new HistoryState(history.done.addTransform(tr, void 0, options, mustPreserveItems(state)), history.undone, rangesFor(tr.mapping.maps), history.prevTime, history.prevComposition);
		else return new HistoryState(history.done, history.undone.addTransform(tr, void 0, options, mustPreserveItems(state)), null, history.prevTime, history.prevComposition);
		else if (tr.getMeta("addToHistory") !== false && !(appended && appended.getMeta("addToHistory") === false)) {
			let composition = tr.getMeta("composition");
			let newGroup = history.prevTime == 0 || !appended && history.prevComposition != composition && (history.prevTime < (tr.time || 0) - options.newGroupDelay || !isAdjacentTo(tr, history.prevRanges));
			let prevRanges = appended ? mapRanges(history.prevRanges, tr.mapping) : rangesFor(tr.mapping.maps);
			return new HistoryState(history.done.addTransform(tr, newGroup ? state.selection.getBookmark() : void 0, options, mustPreserveItems(state)), Branch.empty, prevRanges, tr.time, composition == null ? history.prevComposition : composition);
		} else if (rebased = tr.getMeta("rebased")) return new HistoryState(history.done.rebased(tr, rebased), history.undone.rebased(tr, rebased), mapRanges(history.prevRanges, tr.mapping), history.prevTime, history.prevComposition);
		else return new HistoryState(history.done.addMaps(tr.mapping.maps), history.undone.addMaps(tr.mapping.maps), mapRanges(history.prevRanges, tr.mapping), history.prevTime, history.prevComposition);
	}
	function isAdjacentTo(transform, prevRanges) {
		if (!prevRanges) return false;
		if (!transform.docChanged) return true;
		let adjacent = false;
		transform.mapping.maps[0].forEach((start, end) => {
			for (let i = 0; i < prevRanges.length; i += 2) if (start <= prevRanges[i + 1] && end >= prevRanges[i]) adjacent = true;
		});
		return adjacent;
	}
	function rangesFor(maps) {
		let result = [];
		for (let i = maps.length - 1; i >= 0 && result.length == 0; i--) maps[i].forEach((_from, _to, from, to) => result.push(from, to));
		return result;
	}
	function mapRanges(ranges, mapping) {
		if (!ranges) return null;
		let result = [];
		for (let i = 0; i < ranges.length; i += 2) {
			let from = mapping.map(ranges[i], 1), to = mapping.map(ranges[i + 1], -1);
			if (from <= to) result.push(from, to);
		}
		return result;
	}
	function histTransaction(history, state, redo) {
		let preserveItems = mustPreserveItems(state);
		let histOptions = historyKey.get(state).spec.config;
		let pop = (redo ? history.undone : history.done).popEvent(state, preserveItems);
		if (!pop) return null;
		let selection = pop.selection.resolve(pop.transform.doc);
		let added = (redo ? history.done : history.undone).addTransform(pop.transform, state.selection.getBookmark(), histOptions, preserveItems);
		let newHist = new HistoryState(redo ? added : pop.remaining, redo ? pop.remaining : added, null, 0, -1);
		return pop.transform.setSelection(selection).setMeta(historyKey, {
			redo,
			historyState: newHist
		});
	}
	var cachedPreserveItems = false, cachedPreserveItemsPlugins = null;
	function mustPreserveItems(state) {
		let plugins = state.plugins;
		if (cachedPreserveItemsPlugins != plugins) {
			cachedPreserveItems = false;
			cachedPreserveItemsPlugins = plugins;
			for (let i = 0; i < plugins.length; i++) if (plugins[i].spec.historyPreserveItems) {
				cachedPreserveItems = true;
				break;
			}
		}
		return cachedPreserveItems;
	}
	var historyKey = new PluginKey("history");
	var closeHistoryKey = new PluginKey("closeHistory");
	/**
	Returns a plugin that enables the undo history for an editor. The
	plugin will track undo and redo stacks, which can be used with the
	[`undo`](https://prosemirror.net/docs/ref/#history.undo) and [`redo`](https://prosemirror.net/docs/ref/#history.redo) commands.
	
	You can set an `"addToHistory"` [metadata
	property](https://prosemirror.net/docs/ref/#state.Transaction.setMeta) of `false` on a transaction
	to prevent it from being rolled back by undo.
	*/
	function history(config = {}) {
		config = {
			depth: config.depth || 100,
			newGroupDelay: config.newGroupDelay || 500
		};
		return new Plugin({
			key: historyKey,
			state: {
				init() {
					return new HistoryState(Branch.empty, Branch.empty, null, 0, -1);
				},
				apply(tr, hist, state) {
					return applyTransaction(hist, state, tr, config);
				}
			},
			config,
			props: { handleDOMEvents: { beforeinput(view, e) {
				let inputType = e.inputType;
				let command = inputType == "historyUndo" ? undo : inputType == "historyRedo" ? redo : null;
				if (!command || !view.editable) return false;
				e.preventDefault();
				return command(view.state, view.dispatch);
			} } }
		});
	}
	function buildCommand(redo, scroll) {
		return (state, dispatch) => {
			let hist = historyKey.getState(state);
			if (!hist || (redo ? hist.undone : hist.done).eventCount == 0) return false;
			if (dispatch) {
				let tr = histTransaction(hist, state, redo);
				if (tr) dispatch(scroll ? tr.scrollIntoView() : tr);
			}
			return true;
		};
	}
	/**
	A command function that undoes the last change, if any.
	*/
	var undo = buildCommand(false, true);
	/**
	A command function that redoes the last undone change, if any.
	*/
	var redo = buildCommand(true, true);
	//#endregion
	//#region node_modules/prosemirror-commands/dist/index.js
	/**
	Delete the selection, if there is one.
	*/
	var deleteSelection = (state, dispatch) => {
		if (state.selection.empty) return false;
		if (dispatch) dispatch(state.tr.deleteSelection().scrollIntoView());
		return true;
	};
	function atBlockStart(state, view) {
		let { $cursor } = state.selection;
		if (!$cursor || (view ? !view.endOfTextblock("backward", state) : $cursor.parentOffset > 0)) return null;
		return $cursor;
	}
	/**
	If the selection is empty and at the start of a textblock, try to
	reduce the distance between that block and the one before it—if
	there's a block directly before it that can be joined, join them.
	If not, try to move the selected block closer to the next one in
	the document structure by lifting it out of its parent or moving it
	into a parent of the previous block. Will use the view for accurate
	(bidi-aware) start-of-textblock detection if given.
	*/
	var joinBackward = (state, dispatch, view) => {
		let $cursor = atBlockStart(state, view);
		if (!$cursor) return false;
		let $cut = findCutBefore($cursor);
		if (!$cut) {
			let range = $cursor.blockRange(), target = range && liftTarget(range);
			if (target == null) return false;
			if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView());
			return true;
		}
		let before = $cut.nodeBefore;
		if (deleteBarrier(state, $cut, dispatch, -1)) return true;
		if ($cursor.parent.content.size == 0 && (textblockAt(before, "end") || NodeSelection.isSelectable(before))) for (let depth = $cursor.depth;; depth--) {
			let delStep = replaceStep(state.doc, $cursor.before(depth), $cursor.after(depth), Slice.empty);
			if (delStep && delStep.slice.size < delStep.to - delStep.from) {
				if (dispatch) {
					let tr = state.tr.step(delStep);
					tr.setSelection(textblockAt(before, "end") ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos, -1)), -1) : NodeSelection.create(tr.doc, $cut.pos - before.nodeSize));
					dispatch(tr.scrollIntoView());
				}
				return true;
			}
			if (depth == 1 || $cursor.node(depth - 1).childCount > 1) break;
		}
		if (before.isAtom && $cut.depth == $cursor.depth - 1) {
			if (dispatch) dispatch(state.tr.delete($cut.pos - before.nodeSize, $cut.pos).scrollIntoView());
			return true;
		}
		return false;
	};
	function textblockAt(node, side, only = false) {
		for (let scan = node; scan; scan = side == "start" ? scan.firstChild : scan.lastChild) {
			if (scan.isTextblock) return true;
			if (only && scan.childCount != 1) return false;
		}
		return false;
	}
	/**
	When the selection is empty and at the start of a textblock, select
	the node before that textblock, if possible. This is intended to be
	bound to keys like backspace, after
	[`joinBackward`](https://prosemirror.net/docs/ref/#commands.joinBackward) or other deleting
	commands, as a fall-back behavior when the schema doesn't allow
	deletion at the selected point.
	*/
	var selectNodeBackward = (state, dispatch, view) => {
		let { $head, empty } = state.selection, $cut = $head;
		if (!empty) return false;
		if ($head.parent.isTextblock) {
			if (view ? !view.endOfTextblock("backward", state) : $head.parentOffset > 0) return false;
			$cut = findCutBefore($head);
		}
		let node = $cut && $cut.nodeBefore;
		if (!node || !NodeSelection.isSelectable(node)) return false;
		if (dispatch) dispatch(state.tr.setSelection(NodeSelection.create(state.doc, $cut.pos - node.nodeSize)).scrollIntoView());
		return true;
	};
	function findCutBefore($pos) {
		if (!$pos.parent.type.spec.isolating) for (let i = $pos.depth - 1; i >= 0; i--) {
			if ($pos.index(i) > 0) return $pos.doc.resolve($pos.before(i + 1));
			if ($pos.node(i).type.spec.isolating) break;
		}
		return null;
	}
	function atBlockEnd(state, view) {
		let { $cursor } = state.selection;
		if (!$cursor || (view ? !view.endOfTextblock("forward", state) : $cursor.parentOffset < $cursor.parent.content.size)) return null;
		return $cursor;
	}
	/**
	If the selection is empty and the cursor is at the end of a
	textblock, try to reduce or remove the boundary between that block
	and the one after it, either by joining them or by moving the other
	block closer to this one in the tree structure. Will use the view
	for accurate start-of-textblock detection if given.
	*/
	var joinForward = (state, dispatch, view) => {
		let $cursor = atBlockEnd(state, view);
		if (!$cursor) return false;
		let $cut = findCutAfter($cursor);
		if (!$cut) return false;
		let after = $cut.nodeAfter;
		if (deleteBarrier(state, $cut, dispatch, 1)) return true;
		if ($cursor.parent.content.size == 0 && (textblockAt(after, "start") || NodeSelection.isSelectable(after))) {
			let delStep = replaceStep(state.doc, $cursor.before(), $cursor.after(), Slice.empty);
			if (delStep && delStep.slice.size < delStep.to - delStep.from) {
				if (dispatch) {
					let tr = state.tr.step(delStep);
					tr.setSelection(textblockAt(after, "start") ? Selection.findFrom(tr.doc.resolve(tr.mapping.map($cut.pos)), 1) : NodeSelection.create(tr.doc, tr.mapping.map($cut.pos)));
					dispatch(tr.scrollIntoView());
				}
				return true;
			}
		}
		if (after.isAtom && $cut.depth == $cursor.depth - 1) {
			if (dispatch) dispatch(state.tr.delete($cut.pos, $cut.pos + after.nodeSize).scrollIntoView());
			return true;
		}
		return false;
	};
	/**
	When the selection is empty and at the end of a textblock, select
	the node coming after that textblock, if possible. This is intended
	to be bound to keys like delete, after
	[`joinForward`](https://prosemirror.net/docs/ref/#commands.joinForward) and similar deleting
	commands, to provide a fall-back behavior when the schema doesn't
	allow deletion at the selected point.
	*/
	var selectNodeForward = (state, dispatch, view) => {
		let { $head, empty } = state.selection, $cut = $head;
		if (!empty) return false;
		if ($head.parent.isTextblock) {
			if (view ? !view.endOfTextblock("forward", state) : $head.parentOffset < $head.parent.content.size) return false;
			$cut = findCutAfter($head);
		}
		let node = $cut && $cut.nodeAfter;
		if (!node || !NodeSelection.isSelectable(node)) return false;
		if (dispatch) dispatch(state.tr.setSelection(NodeSelection.create(state.doc, $cut.pos)).scrollIntoView());
		return true;
	};
	function findCutAfter($pos) {
		if (!$pos.parent.type.spec.isolating) for (let i = $pos.depth - 1; i >= 0; i--) {
			let parent = $pos.node(i);
			if ($pos.index(i) + 1 < parent.childCount) return $pos.doc.resolve($pos.after(i + 1));
			if (parent.type.spec.isolating) break;
		}
		return null;
	}
	/**
	Lift the selected block, or the closest ancestor block of the
	selection that can be lifted, out of its parent node.
	*/
	var lift = (state, dispatch) => {
		let { $from, $to } = state.selection;
		let range = $from.blockRange($to), target = range && liftTarget(range);
		if (target == null) return false;
		if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView());
		return true;
	};
	/**
	If the selection is in a node whose type has a truthy
	[`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) property in its spec, replace the
	selection with a newline character.
	*/
	var newlineInCode = (state, dispatch) => {
		let { $head, $anchor } = state.selection;
		if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) return false;
		if (dispatch) dispatch(state.tr.insertText("\n").scrollIntoView());
		return true;
	};
	function defaultBlockAt(match) {
		for (let i = 0; i < match.edgeCount; i++) {
			let { type } = match.edge(i);
			if (type.isTextblock && !type.hasRequiredAttrs()) return type;
		}
		return null;
	}
	/**
	When the selection is in a node with a truthy
	[`code`](https://prosemirror.net/docs/ref/#model.NodeSpec.code) property in its spec, create a
	default block after the code block, and move the cursor there.
	*/
	var exitCode = (state, dispatch) => {
		let { $head, $anchor } = state.selection;
		if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) return false;
		let above = $head.node(-1), after = $head.indexAfter(-1), type = defaultBlockAt(above.contentMatchAt(after));
		if (!type || !above.canReplaceWith(after, after, type)) return false;
		if (dispatch) {
			let pos = $head.after(), tr = state.tr.replaceWith(pos, pos, type.createAndFill());
			tr.setSelection(Selection.near(tr.doc.resolve(pos), 1));
			dispatch(tr.scrollIntoView());
		}
		return true;
	};
	/**
	If a block node is selected, create an empty paragraph before (if
	it is its parent's first child) or after it.
	*/
	var createParagraphNear = (state, dispatch) => {
		let sel = state.selection, { $from, $to } = sel;
		if (sel instanceof AllSelection || $from.parent.inlineContent || $to.parent.inlineContent) return false;
		let type = defaultBlockAt($to.parent.contentMatchAt($to.indexAfter()));
		if (!type || !type.isTextblock) return false;
		if (dispatch) {
			let side = (!$from.parentOffset && $to.index() < $to.parent.childCount ? $from : $to).pos;
			let tr = state.tr.insert(side, type.createAndFill());
			tr.setSelection(TextSelection.create(tr.doc, side + 1));
			dispatch(tr.scrollIntoView());
		}
		return true;
	};
	/**
	If the cursor is in an empty textblock that can be lifted, lift the
	block.
	*/
	var liftEmptyBlock = (state, dispatch) => {
		let { $cursor } = state.selection;
		if (!$cursor || $cursor.parent.content.size) return false;
		if ($cursor.depth > 1 && $cursor.after() != $cursor.end(-1)) {
			let before = $cursor.before();
			if (canSplit(state.doc, before)) {
				if (dispatch) dispatch(state.tr.split(before).scrollIntoView());
				return true;
			}
		}
		let range = $cursor.blockRange(), target = range && liftTarget(range);
		if (target == null) return false;
		if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView());
		return true;
	};
	/**
	Create a variant of [`splitBlock`](https://prosemirror.net/docs/ref/#commands.splitBlock) that uses
	a custom function to determine the type of the newly split off block.
	*/
	function splitBlockAs(splitNode) {
		return (state, dispatch) => {
			let { $from, $to } = state.selection;
			if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
				if (!$from.parentOffset || !canSplit(state.doc, $from.pos)) return false;
				if (dispatch) dispatch(state.tr.split($from.pos).scrollIntoView());
				return true;
			}
			if (!$from.depth) return false;
			let types = [];
			let splitDepth, deflt, atEnd = false, atStart = false;
			for (let d = $from.depth;; d--) if ($from.node(d).isBlock) {
				atEnd = $from.end(d) == $from.pos + ($from.depth - d);
				atStart = $from.start(d) == $from.pos - ($from.depth - d);
				deflt = defaultBlockAt($from.node(d - 1).contentMatchAt($from.indexAfter(d - 1)));
				let splitType = splitNode && splitNode($to.parent, atEnd, $from);
				types.unshift(splitType || (atEnd && deflt ? { type: deflt } : null));
				splitDepth = d;
				break;
			} else {
				if (d == 1) return false;
				types.unshift(null);
			}
			let tr = state.tr;
			if (state.selection instanceof TextSelection || state.selection instanceof AllSelection) tr.deleteSelection();
			let splitPos = tr.mapping.map($from.pos);
			let can = canSplit(tr.doc, splitPos, types.length, types);
			if (!can) {
				types[0] = deflt ? { type: deflt } : null;
				can = canSplit(tr.doc, splitPos, types.length, types);
			}
			if (!can) return false;
			tr.split(splitPos, types.length, types);
			if (!atEnd && atStart && $from.node(splitDepth).type != deflt) {
				let first = tr.mapping.map($from.before(splitDepth)), $first = tr.doc.resolve(first);
				if (deflt && $from.node(splitDepth - 1).canReplaceWith($first.index(), $first.index() + 1, deflt)) tr.setNodeMarkup(tr.mapping.map($from.before(splitDepth)), deflt);
			}
			if (dispatch) dispatch(tr.scrollIntoView());
			return true;
		};
	}
	/**
	Split the parent block of the selection. If the selection is a text
	selection, also delete its content.
	*/
	var splitBlock = splitBlockAs();
	/**
	Select the whole document.
	*/
	var selectAll = (state, dispatch) => {
		if (dispatch) dispatch(state.tr.setSelection(new AllSelection(state.doc)));
		return true;
	};
	function joinMaybeClear(state, $pos, dispatch) {
		let before = $pos.nodeBefore, after = $pos.nodeAfter, index = $pos.index();
		if (!before || !after || !before.type.compatibleContent(after.type)) return false;
		if (!before.content.size && $pos.parent.canReplace(index - 1, index)) {
			if (dispatch) dispatch(state.tr.delete($pos.pos - before.nodeSize, $pos.pos).scrollIntoView());
			return true;
		}
		if (!$pos.parent.canReplace(index, index + 1) || !(after.isTextblock || canJoin(state.doc, $pos.pos))) return false;
		if (dispatch) dispatch(state.tr.join($pos.pos).scrollIntoView());
		return true;
	}
	function deleteBarrier(state, $cut, dispatch, dir) {
		let before = $cut.nodeBefore, after = $cut.nodeAfter, conn, match;
		let isolated = before.type.spec.isolating || after.type.spec.isolating;
		if (!isolated && joinMaybeClear(state, $cut, dispatch)) return true;
		let canDelAfter = !isolated && $cut.parent.canReplace($cut.index(), $cut.index() + 1);
		if (canDelAfter && (conn = (match = before.contentMatchAt(before.childCount)).findWrapping(after.type)) && match.matchType(conn[0] || after.type).validEnd) {
			if (dispatch) {
				let end = $cut.pos + after.nodeSize, wrap = Fragment.empty;
				for (let i = conn.length - 1; i >= 0; i--) wrap = Fragment.from(conn[i].create(null, wrap));
				wrap = Fragment.from(before.copy(wrap));
				let tr = state.tr.step(new ReplaceAroundStep($cut.pos - 1, end, $cut.pos, end, new Slice(wrap, 1, 0), conn.length, true));
				let $joinAt = tr.doc.resolve(end + 2 * conn.length);
				if ($joinAt.nodeAfter && $joinAt.nodeAfter.type == before.type && canJoin(tr.doc, $joinAt.pos)) tr.join($joinAt.pos);
				dispatch(tr.scrollIntoView());
			}
			return true;
		}
		let selAfter = after.type.spec.isolating || dir > 0 && isolated ? null : Selection.findFrom($cut, 1);
		let range = selAfter && selAfter.$from.blockRange(selAfter.$to), target = range && liftTarget(range);
		if (target != null && target >= $cut.depth) {
			if (dispatch) dispatch(state.tr.lift(range, target).scrollIntoView());
			return true;
		}
		if (canDelAfter && textblockAt(after, "start", true) && textblockAt(before, "end")) {
			let at = before, wrap = [];
			for (;;) {
				wrap.push(at);
				if (at.isTextblock) break;
				at = at.lastChild;
			}
			let afterText = after, afterDepth = 1;
			for (; !afterText.isTextblock; afterText = afterText.firstChild) afterDepth++;
			if (at.canReplace(at.childCount, at.childCount, afterText.content)) {
				if (dispatch) {
					let end = Fragment.empty;
					for (let i = wrap.length - 1; i >= 0; i--) end = Fragment.from(wrap[i].copy(end));
					dispatch(state.tr.step(new ReplaceAroundStep($cut.pos - wrap.length, $cut.pos + after.nodeSize, $cut.pos + afterDepth, $cut.pos + after.nodeSize - afterDepth, new Slice(end, wrap.length, 0), 0, true)).scrollIntoView());
				}
				return true;
			}
		}
		return false;
	}
	function selectTextblockSide(side) {
		return function(state, dispatch) {
			let sel = state.selection, $pos = side < 0 ? sel.$from : sel.$to;
			let depth = $pos.depth;
			while ($pos.node(depth).isInline) {
				if (!depth) return false;
				depth--;
			}
			if (!$pos.node(depth).isTextblock) return false;
			if (dispatch) dispatch(state.tr.setSelection(TextSelection.create(state.doc, side < 0 ? $pos.start(depth) : $pos.end(depth))));
			return true;
		};
	}
	/**
	Moves the cursor to the start of current text block.
	*/
	var selectTextblockStart = selectTextblockSide(-1);
	/**
	Moves the cursor to the end of current text block.
	*/
	var selectTextblockEnd = selectTextblockSide(1);
	/**
	Wrap the selection in a node of the given type with the given
	attributes.
	*/
	function wrapIn(nodeType, attrs = null) {
		return function(state, dispatch) {
			let { $from, $to } = state.selection;
			let range = $from.blockRange($to), wrapping = range && findWrapping(range, nodeType, attrs);
			if (!wrapping) return false;
			if (dispatch) dispatch(state.tr.wrap(range, wrapping).scrollIntoView());
			return true;
		};
	}
	/**
	Returns a command that tries to set the selected textblocks to the
	given node type with the given attributes.
	*/
	function setBlockType(nodeType, attrs = null) {
		return function(state, dispatch) {
			let applicable = false;
			for (let i = 0; i < state.selection.ranges.length && !applicable; i++) {
				let { $from: { pos: from }, $to: { pos: to } } = state.selection.ranges[i];
				state.doc.nodesBetween(from, to, (node, pos) => {
					if (applicable) return false;
					if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) return;
					if (node.type == nodeType) applicable = true;
					else {
						let $pos = state.doc.resolve(pos), index = $pos.index();
						applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType);
					}
				});
			}
			if (!applicable) return false;
			if (dispatch) {
				let tr = state.tr;
				for (let i = 0; i < state.selection.ranges.length; i++) {
					let { $from: { pos: from }, $to: { pos: to } } = state.selection.ranges[i];
					tr.setBlockType(from, to, nodeType, attrs);
				}
				dispatch(tr.scrollIntoView());
			}
			return true;
		};
	}
	function markApplies(doc, ranges, type, enterAtoms) {
		for (let i = 0; i < ranges.length; i++) {
			let { $from, $to } = ranges[i];
			let can = $from.depth == 0 ? doc.inlineContent && doc.type.allowsMarkType(type) : false;
			doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
				if (can || !enterAtoms && node.isAtom && node.isInline && pos >= $from.pos && pos + node.nodeSize <= $to.pos) return false;
				can = node.inlineContent && node.type.allowsMarkType(type);
			});
			if (can) return true;
		}
		return false;
	}
	function removeInlineAtoms(ranges) {
		let result = [];
		for (let i = 0; i < ranges.length; i++) {
			let { $from, $to } = ranges[i];
			$from.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
				if (node.isAtom && node.content.size && node.isInline && pos >= $from.pos && pos + node.nodeSize <= $to.pos) {
					if (pos + 1 > $from.pos) result.push(new SelectionRange($from, $from.doc.resolve(pos + 1)));
					$from = $from.doc.resolve(pos + 1 + node.content.size);
					return false;
				}
			});
			if ($from.pos < $to.pos) result.push(new SelectionRange($from, $to));
		}
		return result;
	}
	/**
	Create a command function that toggles the given mark with the
	given attributes. Will return `false` when the current selection
	doesn't support that mark. This will remove the mark if any marks
	of that type exist in the selection, or add it otherwise. If the
	selection is empty, this applies to the [stored
	marks](https://prosemirror.net/docs/ref/#state.EditorState.storedMarks) instead of a range of the
	document.
	*/
	function toggleMark(markType, attrs = null, options) {
		let removeWhenPresent = (options && options.removeWhenPresent) !== false;
		let enterAtoms = (options && options.enterInlineAtoms) !== false;
		let dropSpace = !(options && options.includeWhitespace);
		return function(state, dispatch) {
			let { empty, $cursor, ranges } = state.selection;
			if (empty && !$cursor || !markApplies(state.doc, ranges, markType, enterAtoms)) return false;
			if (dispatch) if ($cursor) if (markType.isInSet(state.storedMarks || $cursor.marks())) dispatch(state.tr.removeStoredMark(markType));
			else dispatch(state.tr.addStoredMark(markType.create(attrs)));
			else {
				let add, tr = state.tr;
				if (!enterAtoms) ranges = removeInlineAtoms(ranges);
				if (removeWhenPresent) add = !ranges.some((r) => state.doc.rangeHasMark(r.$from.pos, r.$to.pos, markType));
				else add = !ranges.every((r) => {
					let missing = false;
					tr.doc.nodesBetween(r.$from.pos, r.$to.pos, (node, pos, parent) => {
						if (missing) return false;
						missing = !markType.isInSet(node.marks) && !!parent && parent.type.allowsMarkType(markType) && !(node.isText && /^\s*$/.test(node.textBetween(Math.max(0, r.$from.pos - pos), Math.min(node.nodeSize, r.$to.pos - pos))));
					});
					return !missing;
				});
				for (let i = 0; i < ranges.length; i++) {
					let { $from, $to } = ranges[i];
					if (!add) tr.removeMark($from.pos, $to.pos, markType);
					else {
						let from = $from.pos, to = $to.pos, start = $from.nodeAfter, end = $to.nodeBefore;
						let spaceStart = dropSpace && start && start.isText ? /^\s*/.exec(start.text)[0].length : 0;
						let spaceEnd = dropSpace && end && end.isText ? /\s*$/.exec(end.text)[0].length : 0;
						if (from + spaceStart < to) {
							from += spaceStart;
							to -= spaceEnd;
						}
						tr.addMark(from, to, markType.create(attrs));
					}
				}
				dispatch(tr.scrollIntoView());
			}
			return true;
		};
	}
	/**
	Combine a number of command functions into a single function (which
	calls them one by one until one returns true).
	*/
	function chainCommands(...commands) {
		return function(state, dispatch, view) {
			for (let i = 0; i < commands.length; i++) if (commands[i](state, dispatch, view)) return true;
			return false;
		};
	}
	var backspace = chainCommands(deleteSelection, joinBackward, selectNodeBackward);
	var del = chainCommands(deleteSelection, joinForward, selectNodeForward);
	/**
	A basic keymap containing bindings not specific to any schema.
	Binds the following keys (when multiple commands are listed, they
	are chained with [`chainCommands`](https://prosemirror.net/docs/ref/#commands.chainCommands)):
	
	* **Enter** to `newlineInCode`, `createParagraphNear`, `liftEmptyBlock`, `splitBlock`
	* **Mod-Enter** to `exitCode`
	* **Backspace** and **Mod-Backspace** to `deleteSelection`, `joinBackward`, `selectNodeBackward`
	* **Delete** and **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
	* **Mod-Delete** to `deleteSelection`, `joinForward`, `selectNodeForward`
	* **Mod-a** to `selectAll`
	*/
	var pcBaseKeymap = {
		"Enter": chainCommands(newlineInCode, createParagraphNear, liftEmptyBlock, splitBlock),
		"Mod-Enter": exitCode,
		"Backspace": backspace,
		"Mod-Backspace": backspace,
		"Shift-Backspace": backspace,
		"Delete": del,
		"Mod-Delete": del,
		"Mod-a": selectAll
	};
	/**
	A copy of `pcBaseKeymap` that also binds **Ctrl-h** like Backspace,
	**Ctrl-d** like Delete, **Alt-Backspace** like Ctrl-Backspace, and
	**Ctrl-Alt-Backspace**, **Alt-Delete**, and **Alt-d** like
	Ctrl-Delete.
	*/
	var macBaseKeymap = {
		"Ctrl-h": pcBaseKeymap["Backspace"],
		"Alt-Backspace": pcBaseKeymap["Mod-Backspace"],
		"Ctrl-d": pcBaseKeymap["Delete"],
		"Ctrl-Alt-Backspace": pcBaseKeymap["Mod-Delete"],
		"Alt-Delete": pcBaseKeymap["Mod-Delete"],
		"Alt-d": pcBaseKeymap["Mod-Delete"],
		"Ctrl-a": selectTextblockStart,
		"Ctrl-e": selectTextblockEnd
	};
	for (let key in pcBaseKeymap) macBaseKeymap[key] = pcBaseKeymap[key];
	/**
	Depending on the detected platform, this will hold
	[`pcBasekeymap`](https://prosemirror.net/docs/ref/#commands.pcBaseKeymap) or
	[`macBaseKeymap`](https://prosemirror.net/docs/ref/#commands.macBaseKeymap).
	*/
	var baseKeymap = (typeof navigator != "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : typeof os != "undefined" && os.platform ? os.platform() == "darwin" : false) ? macBaseKeymap : pcBaseKeymap;
	//#endregion
	//#region node_modules/prosemirror-inputrules/dist/index.js
	/**
	Input rules are regular expressions describing a piece of text
	that, when typed, causes something to happen. This might be
	changing two dashes into an emdash, wrapping a paragraph starting
	with `"> "` into a blockquote, or something entirely different.
	*/
	var InputRule$1 = class {
		/**
		Create an input rule. The rule applies when the user typed
		something and the text directly in front of the cursor matches
		`match`, which should end with `$`.
		
		The `handler` can be a string, in which case the matched text, or
		the first matched group in the regexp, is replaced by that
		string.
		
		Or a it can be a function, which will be called with the match
		array produced by
		[`RegExp.exec`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec),
		as well as the start and end of the matched range, and which can
		return a [transaction](https://prosemirror.net/docs/ref/#state.Transaction) that describes the
		rule's effect, or null to indicate the input was not handled.
		*/
		constructor(match, handler, options = {}) {
			this.match = match;
			this.match = match;
			this.handler = typeof handler == "string" ? stringHandler$1(handler) : handler;
			this.undoable = options.undoable !== false;
		}
	};
	function stringHandler$1(string) {
		return function(state, match, start, end) {
			let insert = string;
			if (match[1]) {
				let offset = match[0].lastIndexOf(match[1]);
				insert += match[0].slice(offset + match[1].length);
				start += offset;
				let cutOff = start - end;
				if (cutOff > 0) {
					insert = match[0].slice(offset - cutOff, offset) + insert;
					start = end;
				}
			}
			return state.tr.insertText(insert, start, end);
		};
	}
	var MAX_MATCH = 500;
	/**
	Create an input rules plugin. When enabled, it will cause text
	input that matches any of the given rules to trigger the rule's
	action.
	*/
	function inputRules({ rules }) {
		let plugin = new Plugin({
			state: {
				init() {
					return null;
				},
				apply(tr, prev) {
					let stored = tr.getMeta(this);
					if (stored) return stored;
					return tr.selectionSet || tr.docChanged ? null : prev;
				}
			},
			props: {
				handleTextInput(view, from, to, text) {
					return run(view, from, to, text, rules, plugin);
				},
				handleDOMEvents: { compositionend: (view) => {
					setTimeout(() => {
						let { $cursor } = view.state.selection;
						if ($cursor) run(view, $cursor.pos, $cursor.pos, "", rules, plugin);
					});
				} }
			},
			isInputRules: true
		});
		return plugin;
	}
	function run(view, from, to, text, rules, plugin) {
		if (view.composing) return false;
		let state = view.state, $from = state.doc.resolve(from);
		if ($from.parent.type.spec.code) return false;
		let textBefore = $from.parent.textBetween(Math.max(0, $from.parentOffset - MAX_MATCH), $from.parentOffset, null, "￼") + text;
		for (let i = 0; i < rules.length; i++) {
			let rule = rules[i], match = rule.match.exec(textBefore);
			let tr = match && rule.handler(state, match, from - (match[0].length - text.length), to);
			if (!tr) continue;
			if (rule.undoable) tr.setMeta(plugin, {
				transform: tr,
				from,
				to,
				text
			});
			view.dispatch(tr);
			return true;
		}
		return false;
	}
	new InputRule$1(/--$/, "—");
	new InputRule$1(/\.\.\.$/, "…");
	new InputRule$1(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(")$/, "“");
	new InputRule$1(/"$/, "”");
	new InputRule$1(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(')$/, "‘");
	new InputRule$1(/'$/, "’");
	//#endregion
	//#region node_modules/bail/index.js
	/**
	* Throw a given error.
	*
	* @param {Error|null|undefined} [error]
	*   Maybe error.
	* @returns {asserts error is null|undefined}
	*/
	function bail(error) {
		if (error) throw error;
	}
	//#endregion
	//#region node_modules/extend/index.js
	var require_extend = /* @__PURE__ */ __commonJSMin(((exports, module) => {
		var hasOwn = Object.prototype.hasOwnProperty;
		var toStr = Object.prototype.toString;
		var defineProperty = Object.defineProperty;
		var gOPD = Object.getOwnPropertyDescriptor;
		var isArray = function isArray(arr) {
			if (typeof Array.isArray === "function") return Array.isArray(arr);
			return toStr.call(arr) === "[object Array]";
		};
		var isPlainObject = function isPlainObject(obj) {
			if (!obj || toStr.call(obj) !== "[object Object]") return false;
			var hasOwnConstructor = hasOwn.call(obj, "constructor");
			var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
			if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) return false;
			var key;
			for (key in obj);
			return typeof key === "undefined" || hasOwn.call(obj, key);
		};
		var setProperty = function setProperty(target, options) {
			if (defineProperty && options.name === "__proto__") defineProperty(target, options.name, {
				enumerable: true,
				configurable: true,
				value: options.newValue,
				writable: true
			});
			else target[options.name] = options.newValue;
		};
		var getProperty = function getProperty(obj, name) {
			if (name === "__proto__") {
				if (!hasOwn.call(obj, name)) return;
				else if (gOPD) return gOPD(obj, name).value;
			}
			return obj[name];
		};
		module.exports = function extend() {
			var options, name, src, copy, copyIsArray, clone;
			var target = arguments[0];
			var i = 1;
			var length = arguments.length;
			var deep = false;
			if (typeof target === "boolean") {
				deep = target;
				target = arguments[1] || {};
				i = 2;
			}
			if (target == null || typeof target !== "object" && typeof target !== "function") target = {};
			for (; i < length; ++i) {
				options = arguments[i];
				if (options != null) for (name in options) {
					src = getProperty(target, name);
					copy = getProperty(options, name);
					if (target !== copy) {
						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];
							} else clone = src && isPlainObject(src) ? src : {};
							setProperty(target, {
								name,
								newValue: extend(deep, clone, copy)
							});
						} else if (typeof copy !== "undefined") setProperty(target, {
							name,
							newValue: copy
						});
					}
				}
			}
			return target;
		};
	}));
	//#endregion
	//#region node_modules/is-plain-obj/index.js
	function isPlainObject(value) {
		if (typeof value !== "object" || value === null) return false;
		const prototype = Object.getPrototypeOf(value);
		return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
	}
	//#endregion
	//#region node_modules/trough/lib/index.js
	/**
	* @typedef {(error?: Error | null | undefined, ...output: Array<any>) => void} Callback
	*   Callback.
	*
	* @typedef {(...input: Array<any>) => any} Middleware
	*   Ware.
	*
	* @typedef Pipeline
	*   Pipeline.
	* @property {Run} run
	*   Run the pipeline.
	* @property {Use} use
	*   Add middleware.
	*
	* @typedef {(...input: Array<any>) => void} Run
	*   Call all middleware.
	*
	*   Calls `done` on completion with either an error or the output of the
	*   last middleware.
	*
	*   > 👉 **Note**: as the length of input defines whether async functions get a
	*   > `next` function,
	*   > it’s recommended to keep `input` at one value normally.
	
	*
	* @typedef {(fn: Middleware) => Pipeline} Use
	*   Add middleware.
	*/
	/**
	* Create new middleware.
	*
	* @returns {Pipeline}
	*   Pipeline.
	*/
	function trough() {
		/** @type {Array<Middleware>} */
		const fns = [];
		/** @type {Pipeline} */
		const pipeline = {
			run,
			use
		};
		return pipeline;
		/** @type {Run} */
		function run(...values) {
			let middlewareIndex = -1;
			/** @type {Callback} */
			const callback = values.pop();
			if (typeof callback !== "function") throw new TypeError("Expected function as last argument, not " + callback);
			next(null, ...values);
			/**
			* Run the next `fn`, or we’re done.
			*
			* @param {Error | null | undefined} error
			* @param {Array<any>} output
			*/
			function next(error, ...output) {
				const fn = fns[++middlewareIndex];
				let index = -1;
				if (error) {
					callback(error);
					return;
				}
				while (++index < values.length) if (output[index] === null || output[index] === void 0) output[index] = values[index];
				values = output;
				if (fn) wrap(fn, next)(...output);
				else callback(null, ...output);
			}
		}
		/** @type {Use} */
		function use(middelware) {
			if (typeof middelware !== "function") throw new TypeError("Expected `middelware` to be a function, not " + middelware);
			fns.push(middelware);
			return pipeline;
		}
	}
	/**
	* Wrap `middleware` into a uniform interface.
	*
	* You can pass all input to the resulting function.
	* `callback` is then called with the output of `middleware`.
	*
	* If `middleware` accepts more arguments than the later given in input,
	* an extra `done` function is passed to it after that input,
	* which must be called by `middleware`.
	*
	* The first value in `input` is the main input value.
	* All other input values are the rest input values.
	* The values given to `callback` are the input values,
	* merged with every non-nullish output value.
	*
	* * if `middleware` throws an error,
	*   returns a promise that is rejected,
	*   or calls the given `done` function with an error,
	*   `callback` is called with that error
	* * if `middleware` returns a value or returns a promise that is resolved,
	*   that value is the main output value
	* * if `middleware` calls `done`,
	*   all non-nullish values except for the first one (the error) overwrite the
	*   output values
	*
	* @param {Middleware} middleware
	*   Function to wrap.
	* @param {Callback} callback
	*   Callback called with the output of `middleware`.
	* @returns {Run}
	*   Wrapped middleware.
	*/
	function wrap(middleware, callback) {
		/** @type {boolean} */
		let called;
		return wrapped;
		/**
		* Call `middleware`.
		* @this {any}
		* @param {Array<any>} parameters
		* @returns {void}
		*/
		function wrapped(...parameters) {
			const fnExpectsCallback = middleware.length > parameters.length;
			/** @type {any} */
			let result;
			if (fnExpectsCallback) parameters.push(done);
			try {
				result = middleware.apply(this, parameters);
			} catch (error) {
				const exception = error;
				if (fnExpectsCallback && called) throw exception;
				return done(exception);
			}
			if (!fnExpectsCallback) if (result && result.then && typeof result.then === "function") result.then(then, done);
			else if (result instanceof Error) done(result);
			else then(result);
		}
		/**
		* Call `callback`, only once.
		*
		* @type {Callback}
		*/
		function done(error, ...output) {
			if (!called) {
				called = true;
				callback(error, ...output);
			}
		}
		/**
		* Call `done` with one value.
		*
		* @param {any} [value]
		*/
		function then(value) {
			done(null, value);
		}
	}
	//#endregion
	//#region node_modules/unist-util-stringify-position/lib/index.js
	/**
	* @typedef {import('unist').Node} Node
	* @typedef {import('unist').Point} Point
	* @typedef {import('unist').Position} Position
	*/
	/**
	* @typedef NodeLike
	* @property {string} type
	* @property {PositionLike | null | undefined} [position]
	*
	* @typedef PointLike
	* @property {number | null | undefined} [line]
	* @property {number | null | undefined} [column]
	* @property {number | null | undefined} [offset]
	*
	* @typedef PositionLike
	* @property {PointLike | null | undefined} [start]
	* @property {PointLike | null | undefined} [end]
	*/
	/**
	* Serialize the positional info of a point, position (start and end points),
	* or node.
	*
	* @param {Node | NodeLike | Point | PointLike | Position | PositionLike | null | undefined} [value]
	*   Node, position, or point.
	* @returns {string}
	*   Pretty printed positional info of a node (`string`).
	*
	*   In the format of a range `ls:cs-le:ce` (when given `node` or `position`)
	*   or a point `l:c` (when given `point`), where `l` stands for line, `c` for
	*   column, `s` for `start`, and `e` for end.
	*   An empty string (`''`) is returned if the given value is neither `node`,
	*   `position`, nor `point`.
	*/
	function stringifyPosition(value) {
		if (!value || typeof value !== "object") return "";
		if ("position" in value || "type" in value) return position(value.position);
		if ("start" in value || "end" in value) return position(value);
		if ("line" in value || "column" in value) return point$1(value);
		return "";
	}
	/**
	* @param {Point | PointLike | null | undefined} point
	* @returns {string}
	*/
	function point$1(point) {
		return index(point && point.line) + ":" + index(point && point.column);
	}
	/**
	* @param {Position | PositionLike | null | undefined} pos
	* @returns {string}
	*/
	function position(pos) {
		return point$1(pos && pos.start) + "-" + point$1(pos && pos.end);
	}
	/**
	* @param {number | null | undefined} value
	* @returns {number}
	*/
	function index(value) {
		return value && typeof value === "number" ? value : 1;
	}
	//#endregion
	//#region node_modules/vfile-message/lib/index.js
	/**
	* @import {Node, Point, Position} from 'unist'
	*/
	/**
	* @typedef {object & {type: string, position?: Position | undefined}} NodeLike
	*
	* @typedef Options
	*   Configuration.
	* @property {Array<Node> | null | undefined} [ancestors]
	*   Stack of (inclusive) ancestor nodes surrounding the message (optional).
	* @property {Error | null | undefined} [cause]
	*   Original error cause of the message (optional).
	* @property {Point | Position | null | undefined} [place]
	*   Place of message (optional).
	* @property {string | null | undefined} [ruleId]
	*   Category of message (optional, example: `'my-rule'`).
	* @property {string | null | undefined} [source]
	*   Namespace of who sent the message (optional, example: `'my-package'`).
	*/
	/**
	* Message.
	*/
	var VFileMessage = class extends Error {
		/**
		* Create a message for `reason`.
		*
		* > 🪦 **Note**: also has obsolete signatures.
		*
		* @overload
		* @param {string} reason
		* @param {Options | null | undefined} [options]
		* @returns
		*
		* @overload
		* @param {string} reason
		* @param {Node | NodeLike | null | undefined} parent
		* @param {string | null | undefined} [origin]
		* @returns
		*
		* @overload
		* @param {string} reason
		* @param {Point | Position | null | undefined} place
		* @param {string | null | undefined} [origin]
		* @returns
		*
		* @overload
		* @param {string} reason
		* @param {string | null | undefined} [origin]
		* @returns
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {Node | NodeLike | null | undefined} parent
		* @param {string | null | undefined} [origin]
		* @returns
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {Point | Position | null | undefined} place
		* @param {string | null | undefined} [origin]
		* @returns
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {string | null | undefined} [origin]
		* @returns
		*
		* @param {Error | VFileMessage | string} causeOrReason
		*   Reason for message, should use markdown.
		* @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
		*   Configuration (optional).
		* @param {string | null | undefined} [origin]
		*   Place in code where the message originates (example:
		*   `'my-package:my-rule'` or `'my-rule'`).
		* @returns
		*   Instance of `VFileMessage`.
		*/
		constructor(causeOrReason, optionsOrParentOrPlace, origin) {
			super();
			if (typeof optionsOrParentOrPlace === "string") {
				origin = optionsOrParentOrPlace;
				optionsOrParentOrPlace = void 0;
			}
			/** @type {string} */
			let reason = "";
			/** @type {Options} */
			let options = {};
			let legacyCause = false;
			if (optionsOrParentOrPlace) if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) options = { place: optionsOrParentOrPlace };
			else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) options = { place: optionsOrParentOrPlace };
			else if ("type" in optionsOrParentOrPlace) options = {
				ancestors: [optionsOrParentOrPlace],
				place: optionsOrParentOrPlace.position
			};
			else options = { ...optionsOrParentOrPlace };
			if (typeof causeOrReason === "string") reason = causeOrReason;
			else if (!options.cause && causeOrReason) {
				legacyCause = true;
				reason = causeOrReason.message;
				options.cause = causeOrReason;
			}
			if (!options.ruleId && !options.source && typeof origin === "string") {
				const index = origin.indexOf(":");
				if (index === -1) options.ruleId = origin;
				else {
					options.source = origin.slice(0, index);
					options.ruleId = origin.slice(index + 1);
				}
			}
			if (!options.place && options.ancestors && options.ancestors) {
				const parent = options.ancestors[options.ancestors.length - 1];
				if (parent) options.place = parent.position;
			}
			const start = options.place && "start" in options.place ? options.place.start : options.place;
			/**
			* Stack of ancestor nodes surrounding the message.
			*
			* @type {Array<Node> | undefined}
			*/
			this.ancestors = options.ancestors || void 0;
			/**
			* Original error cause of the message.
			*
			* @type {Error | undefined}
			*/
			this.cause = options.cause || void 0;
			/**
			* Starting column of message.
			*
			* @type {number | undefined}
			*/
			this.column = start ? start.column : void 0;
			/**
			* State of problem.
			*
			* * `true` — error, file not usable
			* * `false` — warning, change may be needed
			* * `undefined` — change likely not needed
			*
			* @type {boolean | null | undefined}
			*/
			this.fatal = void 0;
			/**
			* Path of a file (used throughout the `VFile` ecosystem).
			*
			* @type {string | undefined}
			*/
			this.file = "";
			/**
			* Reason for message.
			*
			* @type {string}
			*/
			this.message = reason;
			/**
			* Starting line of error.
			*
			* @type {number | undefined}
			*/
			this.line = start ? start.line : void 0;
			/**
			* Serialized positional info of message.
			*
			* On normal errors, this would be something like `ParseError`, buit in
			* `VFile` messages we use this space to show where an error happened.
			*/
			this.name = stringifyPosition(options.place) || "1:1";
			/**
			* Place of message.
			*
			* @type {Point | Position | undefined}
			*/
			this.place = options.place || void 0;
			/**
			* Reason for message, should use markdown.
			*
			* @type {string}
			*/
			this.reason = this.message;
			/**
			* Category of message (example: `'my-rule'`).
			*
			* @type {string | undefined}
			*/
			this.ruleId = options.ruleId || void 0;
			/**
			* Namespace of message (example: `'my-package'`).
			*
			* @type {string | undefined}
			*/
			this.source = options.source || void 0;
			/**
			* Stack of message.
			*
			* This is used by normal errors to show where something happened in
			* programming code, irrelevant for `VFile` messages,
			*
			* @type {string}
			*/
			this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
			/**
			* Specify the source value that’s being reported, which is deemed
			* incorrect.
			*
			* @type {string | undefined}
			*/
			this.actual = void 0;
			/**
			* Suggest acceptable values that can be used instead of `actual`.
			*
			* @type {Array<string> | undefined}
			*/
			this.expected = void 0;
			/**
			* Long form description of the message (you should use markdown).
			*
			* @type {string | undefined}
			*/
			this.note = void 0;
			/**
			* Link to docs for the message.
			*
			* > 👉 **Note**: this must be an absolute URL that can be passed as `x`
			* > to `new URL(x)`.
			*
			* @type {string | undefined}
			*/
			this.url = void 0;
		}
	};
	VFileMessage.prototype.file = "";
	VFileMessage.prototype.name = "";
	VFileMessage.prototype.reason = "";
	VFileMessage.prototype.message = "";
	VFileMessage.prototype.stack = "";
	VFileMessage.prototype.column = void 0;
	VFileMessage.prototype.line = void 0;
	VFileMessage.prototype.ancestors = void 0;
	VFileMessage.prototype.cause = void 0;
	VFileMessage.prototype.fatal = void 0;
	VFileMessage.prototype.place = void 0;
	VFileMessage.prototype.ruleId = void 0;
	VFileMessage.prototype.source = void 0;
	//#endregion
	//#region node_modules/vfile/lib/minpath.browser.js
	var minpath = {
		basename,
		dirname,
		extname,
		join: join$1,
		sep: "/"
	};
	/**
	* Get the basename from a path.
	*
	* @param {string} path
	*   File path.
	* @param {string | null | undefined} [extname]
	*   Extension to strip.
	* @returns {string}
	*   Stem or basename.
	*/
	function basename(path, extname) {
		if (extname !== void 0 && typeof extname !== "string") throw new TypeError("\"ext\" argument must be a string");
		assertPath$1(path);
		let start = 0;
		let end = -1;
		let index = path.length;
		/** @type {boolean | undefined} */
		let seenNonSlash;
		if (extname === void 0 || extname.length === 0 || extname.length > path.length) {
			while (index--) if (path.codePointAt(index) === 47) {
				if (seenNonSlash) {
					start = index + 1;
					break;
				}
			} else if (end < 0) {
				seenNonSlash = true;
				end = index + 1;
			}
			return end < 0 ? "" : path.slice(start, end);
		}
		if (extname === path) return "";
		let firstNonSlashEnd = -1;
		let extnameIndex = extname.length - 1;
		while (index--) if (path.codePointAt(index) === 47) {
			if (seenNonSlash) {
				start = index + 1;
				break;
			}
		} else {
			if (firstNonSlashEnd < 0) {
				seenNonSlash = true;
				firstNonSlashEnd = index + 1;
			}
			if (extnameIndex > -1) if (path.codePointAt(index) === extname.codePointAt(extnameIndex--)) {
				if (extnameIndex < 0) end = index;
			} else {
				extnameIndex = -1;
				end = firstNonSlashEnd;
			}
		}
		if (start === end) end = firstNonSlashEnd;
		else if (end < 0) end = path.length;
		return path.slice(start, end);
	}
	/**
	* Get the dirname from a path.
	*
	* @param {string} path
	*   File path.
	* @returns {string}
	*   File path.
	*/
	function dirname(path) {
		assertPath$1(path);
		if (path.length === 0) return ".";
		let end = -1;
		let index = path.length;
		/** @type {boolean | undefined} */
		let unmatchedSlash;
		while (--index) if (path.codePointAt(index) === 47) {
			if (unmatchedSlash) {
				end = index;
				break;
			}
		} else if (!unmatchedSlash) unmatchedSlash = true;
		return end < 0 ? path.codePointAt(0) === 47 ? "/" : "." : end === 1 && path.codePointAt(0) === 47 ? "//" : path.slice(0, end);
	}
	/**
	* Get an extname from a path.
	*
	* @param {string} path
	*   File path.
	* @returns {string}
	*   Extname.
	*/
	function extname(path) {
		assertPath$1(path);
		let index = path.length;
		let end = -1;
		let startPart = 0;
		let startDot = -1;
		let preDotState = 0;
		/** @type {boolean | undefined} */
		let unmatchedSlash;
		while (index--) {
			const code = path.codePointAt(index);
			if (code === 47) {
				if (unmatchedSlash) {
					startPart = index + 1;
					break;
				}
				continue;
			}
			if (end < 0) {
				unmatchedSlash = true;
				end = index + 1;
			}
			if (code === 46) {
				if (startDot < 0) startDot = index;
				else if (preDotState !== 1) preDotState = 1;
			} else if (startDot > -1) preDotState = -1;
		}
		if (startDot < 0 || end < 0 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) return "";
		return path.slice(startDot, end);
	}
	/**
	* Join segments from a path.
	*
	* @param {Array<string>} segments
	*   Path segments.
	* @returns {string}
	*   File path.
	*/
	function join$1(...segments) {
		let index = -1;
		/** @type {string | undefined} */
		let joined;
		while (++index < segments.length) {
			assertPath$1(segments[index]);
			if (segments[index]) joined = joined === void 0 ? segments[index] : joined + "/" + segments[index];
		}
		return joined === void 0 ? "." : normalize(joined);
	}
	/**
	* Normalize a basic file path.
	*
	* @param {string} path
	*   File path.
	* @returns {string}
	*   File path.
	*/
	function normalize(path) {
		assertPath$1(path);
		const absolute = path.codePointAt(0) === 47;
		let value = normalizeString(path, !absolute);
		if (value.length === 0 && !absolute) value = ".";
		if (value.length > 0 && path.codePointAt(path.length - 1) === 47) value += "/";
		return absolute ? "/" + value : value;
	}
	/**
	* Resolve `.` and `..` elements in a path with directory names.
	*
	* @param {string} path
	*   File path.
	* @param {boolean} allowAboveRoot
	*   Whether `..` can move above root.
	* @returns {string}
	*   File path.
	*/
	function normalizeString(path, allowAboveRoot) {
		let result = "";
		let lastSegmentLength = 0;
		let lastSlash = -1;
		let dots = 0;
		let index = -1;
		/** @type {number | undefined} */
		let code;
		/** @type {number} */
		let lastSlashIndex;
		while (++index <= path.length) {
			if (index < path.length) code = path.codePointAt(index);
			else if (code === 47) break;
			else code = 47;
			if (code === 47) {
				if (lastSlash === index - 1 || dots === 1) {} else if (lastSlash !== index - 1 && dots === 2) {
					if (result.length < 2 || lastSegmentLength !== 2 || result.codePointAt(result.length - 1) !== 46 || result.codePointAt(result.length - 2) !== 46) {
						if (result.length > 2) {
							lastSlashIndex = result.lastIndexOf("/");
							if (lastSlashIndex !== result.length - 1) {
								if (lastSlashIndex < 0) {
									result = "";
									lastSegmentLength = 0;
								} else {
									result = result.slice(0, lastSlashIndex);
									lastSegmentLength = result.length - 1 - result.lastIndexOf("/");
								}
								lastSlash = index;
								dots = 0;
								continue;
							}
						} else if (result.length > 0) {
							result = "";
							lastSegmentLength = 0;
							lastSlash = index;
							dots = 0;
							continue;
						}
					}
					if (allowAboveRoot) {
						result = result.length > 0 ? result + "/.." : "..";
						lastSegmentLength = 2;
					}
				} else {
					if (result.length > 0) result += "/" + path.slice(lastSlash + 1, index);
					else result = path.slice(lastSlash + 1, index);
					lastSegmentLength = index - lastSlash - 1;
				}
				lastSlash = index;
				dots = 0;
			} else if (code === 46 && dots > -1) dots++;
			else dots = -1;
		}
		return result;
	}
	/**
	* Make sure `path` is a string.
	*
	* @param {string} path
	*   File path.
	* @returns {asserts path is string}
	*   Nothing.
	*/
	function assertPath$1(path) {
		if (typeof path !== "string") throw new TypeError("Path must be a string. Received " + JSON.stringify(path));
	}
	//#endregion
	//#region node_modules/vfile/lib/minproc.browser.js
	var minproc = { cwd };
	function cwd() {
		return "/";
	}
	//#endregion
	//#region node_modules/vfile/lib/minurl.shared.js
	/**
	* Checks if a value has the shape of a WHATWG URL object.
	*
	* Using a symbol or instanceof would not be able to recognize URL objects
	* coming from other implementations (e.g. in Electron), so instead we are
	* checking some well known properties for a lack of a better test.
	*
	* We use `href` and `protocol` as they are the only properties that are
	* easy to retrieve and calculate due to the lazy nature of the getters.
	*
	* We check for auth attribute to distinguish legacy url instance with
	* WHATWG URL instance.
	*
	* @param {unknown} fileUrlOrPath
	*   File path or URL.
	* @returns {fileUrlOrPath is URL}
	*   Whether it’s a URL.
	*/
	function isUrl(fileUrlOrPath) {
		return Boolean(fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && "href" in fileUrlOrPath && fileUrlOrPath.href && "protocol" in fileUrlOrPath && fileUrlOrPath.protocol && fileUrlOrPath.auth === void 0);
	}
	//#endregion
	//#region node_modules/vfile/lib/minurl.browser.js
	/**
	* @param {URL | string} path
	*   File URL.
	* @returns {string}
	*   File URL.
	*/
	function urlToPath(path) {
		if (typeof path === "string") path = new URL(path);
		else if (!isUrl(path)) {
			/** @type {NodeJS.ErrnoException} */
			const error = /* @__PURE__ */ new TypeError("The \"path\" argument must be of type string or an instance of URL. Received `" + path + "`");
			error.code = "ERR_INVALID_ARG_TYPE";
			throw error;
		}
		if (path.protocol !== "file:") {
			/** @type {NodeJS.ErrnoException} */
			const error = /* @__PURE__ */ new TypeError("The URL must be of scheme file");
			error.code = "ERR_INVALID_URL_SCHEME";
			throw error;
		}
		return getPathFromURLPosix(path);
	}
	/**
	* Get a path from a POSIX URL.
	*
	* @param {URL} url
	*   URL.
	* @returns {string}
	*   File path.
	*/
	function getPathFromURLPosix(url) {
		if (url.hostname !== "") {
			/** @type {NodeJS.ErrnoException} */
			const error = /* @__PURE__ */ new TypeError("File URL host must be \"localhost\" or empty on darwin");
			error.code = "ERR_INVALID_FILE_URL_HOST";
			throw error;
		}
		const pathname = url.pathname;
		let index = -1;
		while (++index < pathname.length) if (pathname.codePointAt(index) === 37 && pathname.codePointAt(index + 1) === 50) {
			const third = pathname.codePointAt(index + 2);
			if (third === 70 || third === 102) {
				/** @type {NodeJS.ErrnoException} */
				const error = /* @__PURE__ */ new TypeError("File URL path must not include encoded / characters");
				error.code = "ERR_INVALID_FILE_URL_PATH";
				throw error;
			}
		}
		return decodeURIComponent(pathname);
	}
	//#endregion
	//#region node_modules/vfile/lib/index.js
	/**
	* @import {Node, Point, Position} from 'unist'
	* @import {Options as MessageOptions} from 'vfile-message'
	* @import {Compatible, Data, Map, Options, Value} from 'vfile'
	*/
	/**
	* @typedef {object & {type: string, position?: Position | undefined}} NodeLike
	*/
	/**
	* Order of setting (least specific to most), we need this because otherwise
	* `{stem: 'a', path: '~/b.js'}` would throw, as a path is needed before a
	* stem can be set.
	*/
	var order = [
		"history",
		"path",
		"basename",
		"stem",
		"extname",
		"dirname"
	];
	var VFile = class {
		/**
		* Create a new virtual file.
		*
		* `options` is treated as:
		*
		* *   `string` or `Uint8Array` — `{value: options}`
		* *   `URL` — `{path: options}`
		* *   `VFile` — shallow copies its data over to the new file
		* *   `object` — all fields are shallow copied over to the new file
		*
		* Path related fields are set in the following order (least specific to
		* most specific): `history`, `path`, `basename`, `stem`, `extname`,
		* `dirname`.
		*
		* You cannot set `dirname` or `extname` without setting either `history`,
		* `path`, `basename`, or `stem` too.
		*
		* @param {Compatible | null | undefined} [value]
		*   File value.
		* @returns
		*   New instance.
		*/
		constructor(value) {
			/** @type {Options | VFile} */
			let options;
			if (!value) options = {};
			else if (isUrl(value)) options = { path: value };
			else if (typeof value === "string" || isUint8Array$1(value)) options = { value };
			else options = value;
			/**
			* Base of `path` (default: `process.cwd()` or `'/'` in browsers).
			*
			* @type {string}
			*/
			this.cwd = "cwd" in options ? "" : minproc.cwd();
			/**
			* Place to store custom info (default: `{}`).
			*
			* It’s OK to store custom data directly on the file but moving it to
			* `data` is recommended.
			*
			* @type {Data}
			*/
			this.data = {};
			/**
			* List of file paths the file moved between.
			*
			* The first is the original path and the last is the current path.
			*
			* @type {Array<string>}
			*/
			this.history = [];
			/**
			* List of messages associated with the file.
			*
			* @type {Array<VFileMessage>}
			*/
			this.messages = [];
			/**
			* Raw value.
			*
			* @type {Value}
			*/
			this.value;
			/**
			* Source map.
			*
			* This type is equivalent to the `RawSourceMap` type from the `source-map`
			* module.
			*
			* @type {Map | null | undefined}
			*/
			this.map;
			/**
			* Custom, non-string, compiled, representation.
			*
			* This is used by unified to store non-string results.
			* One example is when turning markdown into React nodes.
			*
			* @type {unknown}
			*/
			this.result;
			/**
			* Whether a file was saved to disk.
			*
			* This is used by vfile reporters.
			*
			* @type {boolean}
			*/
			this.stored;
			let index = -1;
			while (++index < order.length) {
				const field = order[index];
				if (field in options && options[field] !== void 0 && options[field] !== null) this[field] = field === "history" ? [...options[field]] : options[field];
			}
			/** @type {string} */
			let field;
			for (field in options) if (!order.includes(field)) this[field] = options[field];
		}
		/**
		* Get the basename (including extname) (example: `'index.min.js'`).
		*
		* @returns {string | undefined}
		*   Basename.
		*/
		get basename() {
			return typeof this.path === "string" ? minpath.basename(this.path) : void 0;
		}
		/**
		* Set basename (including extname) (`'index.min.js'`).
		*
		* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
		* on windows).
		* Cannot be nullified (use `file.path = file.dirname` instead).
		*
		* @param {string} basename
		*   Basename.
		* @returns {undefined}
		*   Nothing.
		*/
		set basename(basename) {
			assertNonEmpty(basename, "basename");
			assertPart(basename, "basename");
			this.path = minpath.join(this.dirname || "", basename);
		}
		/**
		* Get the parent path (example: `'~'`).
		*
		* @returns {string | undefined}
		*   Dirname.
		*/
		get dirname() {
			return typeof this.path === "string" ? minpath.dirname(this.path) : void 0;
		}
		/**
		* Set the parent path (example: `'~'`).
		*
		* Cannot be set if there’s no `path` yet.
		*
		* @param {string | undefined} dirname
		*   Dirname.
		* @returns {undefined}
		*   Nothing.
		*/
		set dirname(dirname) {
			assertPath(this.basename, "dirname");
			this.path = minpath.join(dirname || "", this.basename);
		}
		/**
		* Get the extname (including dot) (example: `'.js'`).
		*
		* @returns {string | undefined}
		*   Extname.
		*/
		get extname() {
			return typeof this.path === "string" ? minpath.extname(this.path) : void 0;
		}
		/**
		* Set the extname (including dot) (example: `'.js'`).
		*
		* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
		* on windows).
		* Cannot be set if there’s no `path` yet.
		*
		* @param {string | undefined} extname
		*   Extname.
		* @returns {undefined}
		*   Nothing.
		*/
		set extname(extname) {
			assertPart(extname, "extname");
			assertPath(this.dirname, "extname");
			if (extname) {
				if (extname.codePointAt(0) !== 46) throw new Error("`extname` must start with `.`");
				if (extname.includes(".", 1)) throw new Error("`extname` cannot contain multiple dots");
			}
			this.path = minpath.join(this.dirname, this.stem + (extname || ""));
		}
		/**
		* Get the full path (example: `'~/index.min.js'`).
		*
		* @returns {string}
		*   Path.
		*/
		get path() {
			return this.history[this.history.length - 1];
		}
		/**
		* Set the full path (example: `'~/index.min.js'`).
		*
		* Cannot be nullified.
		* You can set a file URL (a `URL` object with a `file:` protocol) which will
		* be turned into a path with `url.fileURLToPath`.
		*
		* @param {URL | string} path
		*   Path.
		* @returns {undefined}
		*   Nothing.
		*/
		set path(path) {
			if (isUrl(path)) path = urlToPath(path);
			assertNonEmpty(path, "path");
			if (this.path !== path) this.history.push(path);
		}
		/**
		* Get the stem (basename w/o extname) (example: `'index.min'`).
		*
		* @returns {string | undefined}
		*   Stem.
		*/
		get stem() {
			return typeof this.path === "string" ? minpath.basename(this.path, this.extname) : void 0;
		}
		/**
		* Set the stem (basename w/o extname) (example: `'index.min'`).
		*
		* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
		* on windows).
		* Cannot be nullified (use `file.path = file.dirname` instead).
		*
		* @param {string} stem
		*   Stem.
		* @returns {undefined}
		*   Nothing.
		*/
		set stem(stem) {
			assertNonEmpty(stem, "stem");
			assertPart(stem, "stem");
			this.path = minpath.join(this.dirname || "", stem + (this.extname || ""));
		}
		/**
		* Create a fatal message for `reason` associated with the file.
		*
		* The `fatal` field of the message is set to `true` (error; file not usable)
		* and the `file` field is set to the current file path.
		* The message is added to the `messages` field on `file`.
		*
		* > 🪦 **Note**: also has obsolete signatures.
		*
		* @overload
		* @param {string} reason
		* @param {MessageOptions | null | undefined} [options]
		* @returns {never}
		*
		* @overload
		* @param {string} reason
		* @param {Node | NodeLike | null | undefined} parent
		* @param {string | null | undefined} [origin]
		* @returns {never}
		*
		* @overload
		* @param {string} reason
		* @param {Point | Position | null | undefined} place
		* @param {string | null | undefined} [origin]
		* @returns {never}
		*
		* @overload
		* @param {string} reason
		* @param {string | null | undefined} [origin]
		* @returns {never}
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {Node | NodeLike | null | undefined} parent
		* @param {string | null | undefined} [origin]
		* @returns {never}
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {Point | Position | null | undefined} place
		* @param {string | null | undefined} [origin]
		* @returns {never}
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {string | null | undefined} [origin]
		* @returns {never}
		*
		* @param {Error | VFileMessage | string} causeOrReason
		*   Reason for message, should use markdown.
		* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
		*   Configuration (optional).
		* @param {string | null | undefined} [origin]
		*   Place in code where the message originates (example:
		*   `'my-package:my-rule'` or `'my-rule'`).
		* @returns {never}
		*   Never.
		* @throws {VFileMessage}
		*   Message.
		*/
		fail(causeOrReason, optionsOrParentOrPlace, origin) {
			const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
			message.fatal = true;
			throw message;
		}
		/**
		* Create an info message for `reason` associated with the file.
		*
		* The `fatal` field of the message is set to `undefined` (info; change
		* likely not needed) and the `file` field is set to the current file path.
		* The message is added to the `messages` field on `file`.
		*
		* > 🪦 **Note**: also has obsolete signatures.
		*
		* @overload
		* @param {string} reason
		* @param {MessageOptions | null | undefined} [options]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {string} reason
		* @param {Node | NodeLike | null | undefined} parent
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {string} reason
		* @param {Point | Position | null | undefined} place
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {string} reason
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {Node | NodeLike | null | undefined} parent
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {Point | Position | null | undefined} place
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @param {Error | VFileMessage | string} causeOrReason
		*   Reason for message, should use markdown.
		* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
		*   Configuration (optional).
		* @param {string | null | undefined} [origin]
		*   Place in code where the message originates (example:
		*   `'my-package:my-rule'` or `'my-rule'`).
		* @returns {VFileMessage}
		*   Message.
		*/
		info(causeOrReason, optionsOrParentOrPlace, origin) {
			const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
			message.fatal = void 0;
			return message;
		}
		/**
		* Create a message for `reason` associated with the file.
		*
		* The `fatal` field of the message is set to `false` (warning; change may be
		* needed) and the `file` field is set to the current file path.
		* The message is added to the `messages` field on `file`.
		*
		* > 🪦 **Note**: also has obsolete signatures.
		*
		* @overload
		* @param {string} reason
		* @param {MessageOptions | null | undefined} [options]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {string} reason
		* @param {Node | NodeLike | null | undefined} parent
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {string} reason
		* @param {Point | Position | null | undefined} place
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {string} reason
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {Node | NodeLike | null | undefined} parent
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {Point | Position | null | undefined} place
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @overload
		* @param {Error | VFileMessage} cause
		* @param {string | null | undefined} [origin]
		* @returns {VFileMessage}
		*
		* @param {Error | VFileMessage | string} causeOrReason
		*   Reason for message, should use markdown.
		* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
		*   Configuration (optional).
		* @param {string | null | undefined} [origin]
		*   Place in code where the message originates (example:
		*   `'my-package:my-rule'` or `'my-rule'`).
		* @returns {VFileMessage}
		*   Message.
		*/
		message(causeOrReason, optionsOrParentOrPlace, origin) {
			const message = new VFileMessage(causeOrReason, optionsOrParentOrPlace, origin);
			if (this.path) {
				message.name = this.path + ":" + message.name;
				message.file = this.path;
			}
			message.fatal = false;
			this.messages.push(message);
			return message;
		}
		/**
		* Serialize the file.
		*
		* > **Note**: which encodings are supported depends on the engine.
		* > For info on Node.js, see:
		* > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
		*
		* @param {string | null | undefined} [encoding='utf8']
		*   Character encoding to understand `value` as when it’s a `Uint8Array`
		*   (default: `'utf-8'`).
		* @returns {string}
		*   Serialized file.
		*/
		toString(encoding) {
			if (this.value === void 0) return "";
			if (typeof this.value === "string") return this.value;
			return new TextDecoder(encoding || void 0).decode(this.value);
		}
	};
	/**
	* Assert that `part` is not a path (as in, does not contain `path.sep`).
	*
	* @param {string | null | undefined} part
	*   File path part.
	* @param {string} name
	*   Part name.
	* @returns {undefined}
	*   Nothing.
	*/
	function assertPart(part, name) {
		if (part && part.includes(minpath.sep)) throw new Error("`" + name + "` cannot be a path: did not expect `" + minpath.sep + "`");
	}
	/**
	* Assert that `part` is not empty.
	*
	* @param {string | undefined} part
	*   Thing.
	* @param {string} name
	*   Part name.
	* @returns {asserts part is string}
	*   Nothing.
	*/
	function assertNonEmpty(part, name) {
		if (!part) throw new Error("`" + name + "` cannot be empty");
	}
	/**
	* Assert `path` exists.
	*
	* @param {string | undefined} path
	*   Path.
	* @param {string} name
	*   Dependency name.
	* @returns {asserts path is string}
	*   Nothing.
	*/
	function assertPath(path, name) {
		if (!path) throw new Error("Setting `" + name + "` requires `path` to be set too");
	}
	/**
	* Assert `value` is an `Uint8Array`.
	*
	* @param {unknown} value
	*   thing.
	* @returns {value is Uint8Array}
	*   Whether `value` is an `Uint8Array`.
	*/
	function isUint8Array$1(value) {
		return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
	}
	//#endregion
	//#region node_modules/unified/lib/callable-instance.js
	var CallableInstance = (function(property) {
		const proto = this.constructor.prototype;
		const value = proto[property];
		/** @type {(...parameters: Array<unknown>) => unknown} */
		const apply = function() {
			return value.apply(apply, arguments);
		};
		Object.setPrototypeOf(apply, proto);
		return apply;
	});
	//#endregion
	//#region node_modules/unified/lib/index.js
	/**
	* @typedef {import('trough').Pipeline} Pipeline
	*
	* @typedef {import('unist').Node} Node
	*
	* @typedef {import('vfile').Compatible} Compatible
	* @typedef {import('vfile').Value} Value
	*
	* @typedef {import('../index.js').CompileResultMap} CompileResultMap
	* @typedef {import('../index.js').Data} Data
	* @typedef {import('../index.js').Settings} Settings
	*/
	/**
	* @typedef {CompileResultMap[keyof CompileResultMap]} CompileResults
	*   Acceptable results from compilers.
	*
	*   To register custom results, add them to
	*   {@linkcode CompileResultMap}.
	*/
	/**
	* @template {Node} [Tree=Node]
	*   The node that the compiler receives (default: `Node`).
	* @template {CompileResults} [Result=CompileResults]
	*   The thing that the compiler yields (default: `CompileResults`).
	* @callback Compiler
	*   A **compiler** handles the compiling of a syntax tree to something else
	*   (in most cases, text) (TypeScript type).
	*
	*   It is used in the stringify phase and called with a {@linkcode Node}
	*   and {@linkcode VFile} representation of the document to compile.
	*   It should return the textual representation of the given tree (typically
	*   `string`).
	*
	*   > **Note**: unified typically compiles by serializing: most compilers
	*   > return `string` (or `Uint8Array`).
	*   > Some compilers, such as the one configured with
	*   > [`rehype-react`][rehype-react], return other values (in this case, a
	*   > React tree).
	*   > If you’re using a compiler that doesn’t serialize, expect different
	*   > result values.
	*   >
	*   > To register custom results in TypeScript, add them to
	*   > {@linkcode CompileResultMap}.
	*
	*   [rehype-react]: https://github.com/rehypejs/rehype-react
	* @param {Tree} tree
	*   Tree to compile.
	* @param {VFile} file
	*   File associated with `tree`.
	* @returns {Result}
	*   New content: compiled text (`string` or `Uint8Array`, for `file.value`) or
	*   something else (for `file.result`).
	*/
	/**
	* @template {Node} [Tree=Node]
	*   The node that the parser yields (default: `Node`)
	* @callback Parser
	*   A **parser** handles the parsing of text to a syntax tree.
	*
	*   It is used in the parse phase and is called with a `string` and
	*   {@linkcode VFile} of the document to parse.
	*   It must return the syntax tree representation of the given file
	*   ({@linkcode Node}).
	* @param {string} document
	*   Document to parse.
	* @param {VFile} file
	*   File associated with `document`.
	* @returns {Tree}
	*   Node representing the given file.
	*/
	/**
	* @typedef {(
	*   Plugin<Array<any>, any, any> |
	*   PluginTuple<Array<any>, any, any> |
	*   Preset
	* )} Pluggable
	*   Union of the different ways to add plugins and settings.
	*/
	/**
	* @typedef {Array<Pluggable>} PluggableList
	*   List of plugins and presets.
	*/
	/**
	* @template {Array<unknown>} [PluginParameters=[]]
	*   Arguments passed to the plugin (default: `[]`, the empty tuple).
	* @template {Node | string | undefined} [Input=Node]
	*   Value that is expected as input (default: `Node`).
	*
	*   *   If the plugin returns a {@linkcode Transformer}, this
	*       should be the node it expects.
	*   *   If the plugin sets a {@linkcode Parser}, this should be
	*       `string`.
	*   *   If the plugin sets a {@linkcode Compiler}, this should be the
	*       node it expects.
	* @template [Output=Input]
	*   Value that is yielded as output (default: `Input`).
	*
	*   *   If the plugin returns a {@linkcode Transformer}, this
	*       should be the node that that yields.
	*   *   If the plugin sets a {@linkcode Parser}, this should be the
	*       node that it yields.
	*   *   If the plugin sets a {@linkcode Compiler}, this should be
	*       result it yields.
	* @typedef {(
	*   (this: Processor, ...parameters: PluginParameters) =>
	*     Input extends string ? // Parser.
	*        Output extends Node | undefined ? undefined | void : never :
	*     Output extends CompileResults ? // Compiler.
	*        Input extends Node | undefined ? undefined | void : never :
	*     Transformer<
	*       Input extends Node ? Input : Node,
	*       Output extends Node ? Output : Node
	*     > | undefined | void
	* )} Plugin
	*   Single plugin.
	*
	*   Plugins configure the processors they are applied on in the following
	*   ways:
	*
	*   *   they change the processor, such as the parser, the compiler, or by
	*       configuring data
	*   *   they specify how to handle trees and files
	*
	*   In practice, they are functions that can receive options and configure the
	*   processor (`this`).
	*
	*   > **Note**: plugins are called when the processor is *frozen*, not when
	*   > they are applied.
	*/
	/**
	* Tuple of a plugin and its configuration.
	*
	* The first item is a plugin, the rest are its parameters.
	*
	* @template {Array<unknown>} [TupleParameters=[]]
	*   Arguments passed to the plugin (default: `[]`, the empty tuple).
	* @template {Node | string | undefined} [Input=undefined]
	*   Value that is expected as input (optional).
	*
	*   *   If the plugin returns a {@linkcode Transformer}, this
	*       should be the node it expects.
	*   *   If the plugin sets a {@linkcode Parser}, this should be
	*       `string`.
	*   *   If the plugin sets a {@linkcode Compiler}, this should be the
	*       node it expects.
	* @template [Output=undefined] (optional).
	*   Value that is yielded as output.
	*
	*   *   If the plugin returns a {@linkcode Transformer}, this
	*       should be the node that that yields.
	*   *   If the plugin sets a {@linkcode Parser}, this should be the
	*       node that it yields.
	*   *   If the plugin sets a {@linkcode Compiler}, this should be
	*       result it yields.
	* @typedef {(
	*   [
	*     plugin: Plugin<TupleParameters, Input, Output>,
	*     ...parameters: TupleParameters
	*   ]
	* )} PluginTuple
	*/
	/**
	* @typedef Preset
	*   Sharable configuration.
	*
	*   They can contain plugins and settings.
	* @property {PluggableList | undefined} [plugins]
	*   List of plugins and presets (optional).
	* @property {Settings | undefined} [settings]
	*   Shared settings for parsers and compilers (optional).
	*/
	/**
	* @template {VFile} [File=VFile]
	*   The file that the callback receives (default: `VFile`).
	* @callback ProcessCallback
	*   Callback called when the process is done.
	*
	*   Called with either an error or a result.
	* @param {Error | undefined} [error]
	*   Fatal error (optional).
	* @param {File | undefined} [file]
	*   Processed file (optional).
	* @returns {undefined}
	*   Nothing.
	*/
	/**
	* @template {Node} [Tree=Node]
	*   The tree that the callback receives (default: `Node`).
	* @callback RunCallback
	*   Callback called when transformers are done.
	*
	*   Called with either an error or results.
	* @param {Error | undefined} [error]
	*   Fatal error (optional).
	* @param {Tree | undefined} [tree]
	*   Transformed tree (optional).
	* @param {VFile | undefined} [file]
	*   File (optional).
	* @returns {undefined}
	*   Nothing.
	*/
	/**
	* @template {Node} [Output=Node]
	*   Node type that the transformer yields (default: `Node`).
	* @callback TransformCallback
	*   Callback passed to transforms.
	*
	*   If the signature of a `transformer` accepts a third argument, the
	*   transformer may perform asynchronous operations, and must call it.
	* @param {Error | undefined} [error]
	*   Fatal error to stop the process (optional).
	* @param {Output | undefined} [tree]
	*   New, changed, tree (optional).
	* @param {VFile | undefined} [file]
	*   New, changed, file (optional).
	* @returns {undefined}
	*   Nothing.
	*/
	/**
	* @template {Node} [Input=Node]
	*   Node type that the transformer expects (default: `Node`).
	* @template {Node} [Output=Input]
	*   Node type that the transformer yields (default: `Input`).
	* @callback Transformer
	*   Transformers handle syntax trees and files.
	*
	*   They are functions that are called each time a syntax tree and file are
	*   passed through the run phase.
	*   When an error occurs in them (either because it’s thrown, returned,
	*   rejected, or passed to `next`), the process stops.
	*
	*   The run phase is handled by [`trough`][trough], see its documentation for
	*   the exact semantics of these functions.
	*
	*   > **Note**: you should likely ignore `next`: don’t accept it.
	*   > it supports callback-style async work.
	*   > But promises are likely easier to reason about.
	*
	*   [trough]: https://github.com/wooorm/trough#function-fninput-next
	* @param {Input} tree
	*   Tree to handle.
	* @param {VFile} file
	*   File to handle.
	* @param {TransformCallback<Output>} next
	*   Callback.
	* @returns {(
	*   Promise<Output | undefined | void> |
	*   Promise<never> | // For some reason this is needed separately.
	*   Output |
	*   Error |
	*   undefined |
	*   void
	* )}
	*   If you accept `next`, nothing.
	*   Otherwise:
	*
	*   *   `Error` — fatal error to stop the process
	*   *   `Promise<undefined>` or `undefined` — the next transformer keeps using
	*       same tree
	*   *   `Promise<Node>` or `Node` — new, changed, tree
	*/
	/**
	* @template {Node | undefined} ParseTree
	*   Output of `parse`.
	* @template {Node | undefined} HeadTree
	*   Input for `run`.
	* @template {Node | undefined} TailTree
	*   Output for `run`.
	* @template {Node | undefined} CompileTree
	*   Input of `stringify`.
	* @template {CompileResults | undefined} CompileResult
	*   Output of `stringify`.
	* @template {Node | string | undefined} Input
	*   Input of plugin.
	* @template Output
	*   Output of plugin (optional).
	* @typedef {(
	*   Input extends string
	*     ? Output extends Node | undefined
	*       ? // Parser.
	*         Processor<
	*           Output extends undefined ? ParseTree : Output,
	*           HeadTree,
	*           TailTree,
	*           CompileTree,
	*           CompileResult
	*         >
	*       : // Unknown.
	*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
	*     : Output extends CompileResults
	*     ? Input extends Node | undefined
	*       ? // Compiler.
	*         Processor<
	*           ParseTree,
	*           HeadTree,
	*           TailTree,
	*           Input extends undefined ? CompileTree : Input,
	*           Output extends undefined ? CompileResult : Output
	*         >
	*       : // Unknown.
	*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
	*     : Input extends Node | undefined
	*     ? Output extends Node | undefined
	*       ? // Transform.
	*         Processor<
	*           ParseTree,
	*           HeadTree extends undefined ? Input : HeadTree,
	*           Output extends undefined ? TailTree : Output,
	*           CompileTree,
	*           CompileResult
	*         >
	*       : // Unknown.
	*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
	*     : // Unknown.
	*       Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
	* )} UsePlugin
	*   Create a processor based on the input/output of a {@link Plugin plugin}.
	*/
	/**
	* @template {CompileResults | undefined} Result
	*   Node type that the transformer yields.
	* @typedef {(
	*   Result extends Value | undefined ?
	*     VFile :
	*     VFile & {result: Result}
	*   )} VFileWithOutput
	*   Type to generate a {@linkcode VFile} corresponding to a compiler result.
	*
	*   If a result that is not acceptable on a `VFile` is used, that will
	*   be stored on the `result` field of {@linkcode VFile}.
	*/
	var import_extend = /* @__PURE__ */ __toESM(require_extend(), 1);
	var own$3 = {}.hasOwnProperty;
	/**
	* Create a new processor.
	*
	* @example
	*   This example shows how a new processor can be created (from `remark`) and linked
	*   to **stdin**(4) and **stdout**(4).
	*
	*   ```js
	*   import process from 'node:process'
	*   import concatStream from 'concat-stream'
	*   import {remark} from 'remark'
	*
	*   process.stdin.pipe(
	*     concatStream(function (buf) {
	*       process.stdout.write(String(remark().processSync(buf)))
	*     })
	*   )
	*   ```
	*
	* @returns
	*   New *unfrozen* processor (`processor`).
	*
	*   This processor is configured to work the same as its ancestor.
	*   When the descendant processor is configured in the future it does not
	*   affect the ancestral processor.
	*/
	var unified = new class Processor extends CallableInstance {
		/**
		* Create a processor.
		*/
		constructor() {
			super("copy");
			/**
			* Compiler to use (deprecated).
			*
			* @deprecated
			*   Use `compiler` instead.
			* @type {(
			*   Compiler<
			*     CompileTree extends undefined ? Node : CompileTree,
			*     CompileResult extends undefined ? CompileResults : CompileResult
			*   > |
			*   undefined
			* )}
			*/
			this.Compiler = void 0;
			/**
			* Parser to use (deprecated).
			*
			* @deprecated
			*   Use `parser` instead.
			* @type {(
			*   Parser<ParseTree extends undefined ? Node : ParseTree> |
			*   undefined
			* )}
			*/
			this.Parser = void 0;
			/**
			* Internal list of configured plugins.
			*
			* @deprecated
			*   This is a private internal property and should not be used.
			* @type {Array<PluginTuple<Array<unknown>>>}
			*/
			this.attachers = [];
			/**
			* Compiler to use.
			*
			* @type {(
			*   Compiler<
			*     CompileTree extends undefined ? Node : CompileTree,
			*     CompileResult extends undefined ? CompileResults : CompileResult
			*   > |
			*   undefined
			* )}
			*/
			this.compiler = void 0;
			/**
			* Internal state to track where we are while freezing.
			*
			* @deprecated
			*   This is a private internal property and should not be used.
			* @type {number}
			*/
			this.freezeIndex = -1;
			/**
			* Internal state to track whether we’re frozen.
			*
			* @deprecated
			*   This is a private internal property and should not be used.
			* @type {boolean | undefined}
			*/
			this.frozen = void 0;
			/**
			* Internal state.
			*
			* @deprecated
			*   This is a private internal property and should not be used.
			* @type {Data}
			*/
			this.namespace = {};
			/**
			* Parser to use.
			*
			* @type {(
			*   Parser<ParseTree extends undefined ? Node : ParseTree> |
			*   undefined
			* )}
			*/
			this.parser = void 0;
			/**
			* Internal list of configured transformers.
			*
			* @deprecated
			*   This is a private internal property and should not be used.
			* @type {Pipeline}
			*/
			this.transformers = trough();
		}
		/**
		* Copy a processor.
		*
		* @deprecated
		*   This is a private internal method and should not be used.
		* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
		*   New *unfrozen* processor ({@linkcode Processor}) that is
		*   configured to work the same as its ancestor.
		*   When the descendant processor is configured in the future it does not
		*   affect the ancestral processor.
		*/
		copy() {
			const destination = new Processor();
			let index = -1;
			while (++index < this.attachers.length) {
				const attacher = this.attachers[index];
				destination.use(...attacher);
			}
			destination.data((0, import_extend.default)(true, {}, this.namespace));
			return destination;
		}
		/**
		* Configure the processor with info available to all plugins.
		* Information is stored in an object.
		*
		* Typically, options can be given to a specific plugin, but sometimes it
		* makes sense to have information shared with several plugins.
		* For example, a list of HTML elements that are self-closing, which is
		* needed during all phases.
		*
		* > **Note**: setting information cannot occur on *frozen* processors.
		* > Call the processor first to create a new unfrozen processor.
		*
		* > **Note**: to register custom data in TypeScript, augment the
		* > {@linkcode Data} interface.
		*
		* @example
		*   This example show how to get and set info:
		*
		*   ```js
		*   import {unified} from 'unified'
		*
		*   const processor = unified().data('alpha', 'bravo')
		*
		*   processor.data('alpha') // => 'bravo'
		*
		*   processor.data() // => {alpha: 'bravo'}
		*
		*   processor.data({charlie: 'delta'})
		*
		*   processor.data() // => {charlie: 'delta'}
		*   ```
		*
		* @template {keyof Data} Key
		*
		* @overload
		* @returns {Data}
		*
		* @overload
		* @param {Data} dataset
		* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
		*
		* @overload
		* @param {Key} key
		* @returns {Data[Key]}
		*
		* @overload
		* @param {Key} key
		* @param {Data[Key]} value
		* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
		*
		* @param {Data | Key} [key]
		*   Key to get or set, or entire dataset to set, or nothing to get the
		*   entire dataset (optional).
		* @param {Data[Key]} [value]
		*   Value to set (optional).
		* @returns {unknown}
		*   The current processor when setting, the value at `key` when getting, or
		*   the entire dataset when getting without key.
		*/
		data(key, value) {
			if (typeof key === "string") {
				if (arguments.length === 2) {
					assertUnfrozen("data", this.frozen);
					this.namespace[key] = value;
					return this;
				}
				return own$3.call(this.namespace, key) && this.namespace[key] || void 0;
			}
			if (key) {
				assertUnfrozen("data", this.frozen);
				this.namespace = key;
				return this;
			}
			return this.namespace;
		}
		/**
		* Freeze a processor.
		*
		* Frozen processors are meant to be extended and not to be configured
		* directly.
		*
		* When a processor is frozen it cannot be unfrozen.
		* New processors working the same way can be created by calling the
		* processor.
		*
		* It’s possible to freeze processors explicitly by calling `.freeze()`.
		* Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
		* `.stringify()`, `.process()`, or `.processSync()` are called.
		*
		* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
		*   The current processor.
		*/
		freeze() {
			if (this.frozen) return this;
			const self = this;
			while (++this.freezeIndex < this.attachers.length) {
				const [attacher, ...options] = this.attachers[this.freezeIndex];
				if (options[0] === false) continue;
				if (options[0] === true) options[0] = void 0;
				const transformer = attacher.call(self, ...options);
				if (typeof transformer === "function") this.transformers.use(transformer);
			}
			this.frozen = true;
			this.freezeIndex = Number.POSITIVE_INFINITY;
			return this;
		}
		/**
		* Parse text to a syntax tree.
		*
		* > **Note**: `parse` freezes the processor if not already *frozen*.
		*
		* > **Note**: `parse` performs the parse phase, not the run phase or other
		* > phases.
		*
		* @param {Compatible | undefined} [file]
		*   file to parse (optional); typically `string` or `VFile`; any value
		*   accepted as `x` in `new VFile(x)`.
		* @returns {ParseTree extends undefined ? Node : ParseTree}
		*   Syntax tree representing `file`.
		*/
		parse(file) {
			this.freeze();
			const realFile = vfile(file);
			const parser = this.parser || this.Parser;
			assertParser("parse", parser);
			return parser(String(realFile), realFile);
		}
		/**
		* Process the given file as configured on the processor.
		*
		* > **Note**: `process` freezes the processor if not already *frozen*.
		*
		* > **Note**: `process` performs the parse, run, and stringify phases.
		*
		* @overload
		* @param {Compatible | undefined} file
		* @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
		* @returns {undefined}
		*
		* @overload
		* @param {Compatible | undefined} [file]
		* @returns {Promise<VFileWithOutput<CompileResult>>}
		*
		* @param {Compatible | undefined} [file]
		*   File (optional); typically `string` or `VFile`]; any value accepted as
		*   `x` in `new VFile(x)`.
		* @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
		*   Callback (optional).
		* @returns {Promise<VFile> | undefined}
		*   Nothing if `done` is given.
		*   Otherwise a promise, rejected with a fatal error or resolved with the
		*   processed file.
		*
		*   The parsed, transformed, and compiled value is available at
		*   `file.value` (see note).
		*
		*   > **Note**: unified typically compiles by serializing: most
		*   > compilers return `string` (or `Uint8Array`).
		*   > Some compilers, such as the one configured with
		*   > [`rehype-react`][rehype-react], return other values (in this case, a
		*   > React tree).
		*   > If you’re using a compiler that doesn’t serialize, expect different
		*   > result values.
		*   >
		*   > To register custom results in TypeScript, add them to
		*   > {@linkcode CompileResultMap}.
		*
		*   [rehype-react]: https://github.com/rehypejs/rehype-react
		*/
		process(file, done) {
			const self = this;
			this.freeze();
			assertParser("process", this.parser || this.Parser);
			assertCompiler("process", this.compiler || this.Compiler);
			return done ? executor(void 0, done) : new Promise(executor);
			/**
			* @param {((file: VFileWithOutput<CompileResult>) => undefined | void) | undefined} resolve
			* @param {(error: Error | undefined) => undefined | void} reject
			* @returns {undefined}
			*/
			function executor(resolve, reject) {
				const realFile = vfile(file);
				const parseTree = self.parse(realFile);
				self.run(parseTree, realFile, function(error, tree, file) {
					if (error || !tree || !file) return realDone(error);
					const compileTree = tree;
					const compileResult = self.stringify(compileTree, file);
					if (looksLikeAValue(compileResult)) file.value = compileResult;
					else file.result = compileResult;
					realDone(error, file);
				});
				/**
				* @param {Error | undefined} error
				* @param {VFileWithOutput<CompileResult> | undefined} [file]
				* @returns {undefined}
				*/
				function realDone(error, file) {
					if (error || !file) reject(error);
					else if (resolve) resolve(file);
					else done(void 0, file);
				}
			}
		}
		/**
		* Process the given file as configured on the processor.
		*
		* An error is thrown if asynchronous transforms are configured.
		*
		* > **Note**: `processSync` freezes the processor if not already *frozen*.
		*
		* > **Note**: `processSync` performs the parse, run, and stringify phases.
		*
		* @param {Compatible | undefined} [file]
		*   File (optional); typically `string` or `VFile`; any value accepted as
		*   `x` in `new VFile(x)`.
		* @returns {VFileWithOutput<CompileResult>}
		*   The processed file.
		*
		*   The parsed, transformed, and compiled value is available at
		*   `file.value` (see note).
		*
		*   > **Note**: unified typically compiles by serializing: most
		*   > compilers return `string` (or `Uint8Array`).
		*   > Some compilers, such as the one configured with
		*   > [`rehype-react`][rehype-react], return other values (in this case, a
		*   > React tree).
		*   > If you’re using a compiler that doesn’t serialize, expect different
		*   > result values.
		*   >
		*   > To register custom results in TypeScript, add them to
		*   > {@linkcode CompileResultMap}.
		*
		*   [rehype-react]: https://github.com/rehypejs/rehype-react
		*/
		processSync(file) {
			/** @type {boolean} */
			let complete = false;
			/** @type {VFileWithOutput<CompileResult> | undefined} */
			let result;
			this.freeze();
			assertParser("processSync", this.parser || this.Parser);
			assertCompiler("processSync", this.compiler || this.Compiler);
			this.process(file, realDone);
			assertDone("processSync", "process", complete);
			return result;
			/**
			* @type {ProcessCallback<VFileWithOutput<CompileResult>>}
			*/
			function realDone(error, file) {
				complete = true;
				bail(error);
				result = file;
			}
		}
		/**
		* Run *transformers* on a syntax tree.
		*
		* > **Note**: `run` freezes the processor if not already *frozen*.
		*
		* > **Note**: `run` performs the run phase, not other phases.
		*
		* @overload
		* @param {HeadTree extends undefined ? Node : HeadTree} tree
		* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
		* @returns {undefined}
		*
		* @overload
		* @param {HeadTree extends undefined ? Node : HeadTree} tree
		* @param {Compatible | undefined} file
		* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
		* @returns {undefined}
		*
		* @overload
		* @param {HeadTree extends undefined ? Node : HeadTree} tree
		* @param {Compatible | undefined} [file]
		* @returns {Promise<TailTree extends undefined ? Node : TailTree>}
		*
		* @param {HeadTree extends undefined ? Node : HeadTree} tree
		*   Tree to transform and inspect.
		* @param {(
		*   RunCallback<TailTree extends undefined ? Node : TailTree> |
		*   Compatible
		* )} [file]
		*   File associated with `node` (optional); any value accepted as `x` in
		*   `new VFile(x)`.
		* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
		*   Callback (optional).
		* @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
		*   Nothing if `done` is given.
		*   Otherwise, a promise rejected with a fatal error or resolved with the
		*   transformed tree.
		*/
		run(tree, file, done) {
			assertNode(tree);
			this.freeze();
			const transformers = this.transformers;
			if (!done && typeof file === "function") {
				done = file;
				file = void 0;
			}
			return done ? executor(void 0, done) : new Promise(executor);
			/**
			* @param {(
			*   ((tree: TailTree extends undefined ? Node : TailTree) => undefined | void) |
			*   undefined
			* )} resolve
			* @param {(error: Error) => undefined | void} reject
			* @returns {undefined}
			*/
			function executor(resolve, reject) {
				const realFile = vfile(file);
				transformers.run(tree, realFile, realDone);
				/**
				* @param {Error | undefined} error
				* @param {Node} outputTree
				* @param {VFile} file
				* @returns {undefined}
				*/
				function realDone(error, outputTree, file) {
					const resultingTree = outputTree || tree;
					if (error) reject(error);
					else if (resolve) resolve(resultingTree);
					else done(void 0, resultingTree, file);
				}
			}
		}
		/**
		* Run *transformers* on a syntax tree.
		*
		* An error is thrown if asynchronous transforms are configured.
		*
		* > **Note**: `runSync` freezes the processor if not already *frozen*.
		*
		* > **Note**: `runSync` performs the run phase, not other phases.
		*
		* @param {HeadTree extends undefined ? Node : HeadTree} tree
		*   Tree to transform and inspect.
		* @param {Compatible | undefined} [file]
		*   File associated with `node` (optional); any value accepted as `x` in
		*   `new VFile(x)`.
		* @returns {TailTree extends undefined ? Node : TailTree}
		*   Transformed tree.
		*/
		runSync(tree, file) {
			/** @type {boolean} */
			let complete = false;
			/** @type {(TailTree extends undefined ? Node : TailTree) | undefined} */
			let result;
			this.run(tree, file, realDone);
			assertDone("runSync", "run", complete);
			return result;
			/**
			* @type {RunCallback<TailTree extends undefined ? Node : TailTree>}
			*/
			function realDone(error, tree) {
				bail(error);
				result = tree;
				complete = true;
			}
		}
		/**
		* Compile a syntax tree.
		*
		* > **Note**: `stringify` freezes the processor if not already *frozen*.
		*
		* > **Note**: `stringify` performs the stringify phase, not the run phase
		* > or other phases.
		*
		* @param {CompileTree extends undefined ? Node : CompileTree} tree
		*   Tree to compile.
		* @param {Compatible | undefined} [file]
		*   File associated with `node` (optional); any value accepted as `x` in
		*   `new VFile(x)`.
		* @returns {CompileResult extends undefined ? Value : CompileResult}
		*   Textual representation of the tree (see note).
		*
		*   > **Note**: unified typically compiles by serializing: most compilers
		*   > return `string` (or `Uint8Array`).
		*   > Some compilers, such as the one configured with
		*   > [`rehype-react`][rehype-react], return other values (in this case, a
		*   > React tree).
		*   > If you’re using a compiler that doesn’t serialize, expect different
		*   > result values.
		*   >
		*   > To register custom results in TypeScript, add them to
		*   > {@linkcode CompileResultMap}.
		*
		*   [rehype-react]: https://github.com/rehypejs/rehype-react
		*/
		stringify(tree, file) {
			this.freeze();
			const realFile = vfile(file);
			const compiler = this.compiler || this.Compiler;
			assertCompiler("stringify", compiler);
			assertNode(tree);
			return compiler(tree, realFile);
		}
		/**
		* Configure the processor to use a plugin, a list of usable values, or a
		* preset.
		*
		* If the processor is already using a plugin, the previous plugin
		* configuration is changed based on the options that are passed in.
		* In other words, the plugin is not added a second time.
		*
		* > **Note**: `use` cannot be called on *frozen* processors.
		* > Call the processor first to create a new unfrozen processor.
		*
		* @example
		*   There are many ways to pass plugins to `.use()`.
		*   This example gives an overview:
		*
		*   ```js
		*   import {unified} from 'unified'
		*
		*   unified()
		*     // Plugin with options:
		*     .use(pluginA, {x: true, y: true})
		*     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
		*     .use(pluginA, {y: false, z: true})
		*     // Plugins:
		*     .use([pluginB, pluginC])
		*     // Two plugins, the second with options:
		*     .use([pluginD, [pluginE, {}]])
		*     // Preset with plugins and settings:
		*     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
		*     // Settings only:
		*     .use({settings: {position: false}})
		*   ```
		*
		* @template {Array<unknown>} [Parameters=[]]
		* @template {Node | string | undefined} [Input=undefined]
		* @template [Output=Input]
		*
		* @overload
		* @param {Preset | null | undefined} [preset]
		* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
		*
		* @overload
		* @param {PluggableList} list
		* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
		*
		* @overload
		* @param {Plugin<Parameters, Input, Output>} plugin
		* @param {...(Parameters | [boolean])} parameters
		* @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
		*
		* @param {PluggableList | Plugin | Preset | null | undefined} value
		*   Usable value.
		* @param {...unknown} parameters
		*   Parameters, when a plugin is given as a usable value.
		* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
		*   Current processor.
		*/
		use(value, ...parameters) {
			const attachers = this.attachers;
			const namespace = this.namespace;
			assertUnfrozen("use", this.frozen);
			if (value === null || value === void 0) {} else if (typeof value === "function") addPlugin(value, parameters);
			else if (typeof value === "object") if (Array.isArray(value)) addList(value);
			else addPreset(value);
			else throw new TypeError("Expected usable value, not `" + value + "`");
			return this;
			/**
			* @param {Pluggable} value
			* @returns {undefined}
			*/
			function add(value) {
				if (typeof value === "function") addPlugin(value, []);
				else if (typeof value === "object") if (Array.isArray(value)) {
					const [plugin, ...parameters] = value;
					addPlugin(plugin, parameters);
				} else addPreset(value);
				else throw new TypeError("Expected usable value, not `" + value + "`");
			}
			/**
			* @param {Preset} result
			* @returns {undefined}
			*/
			function addPreset(result) {
				if (!("plugins" in result) && !("settings" in result)) throw new Error("Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither");
				addList(result.plugins);
				if (result.settings) namespace.settings = (0, import_extend.default)(true, namespace.settings, result.settings);
			}
			/**
			* @param {PluggableList | null | undefined} plugins
			* @returns {undefined}
			*/
			function addList(plugins) {
				let index = -1;
				if (plugins === null || plugins === void 0) {} else if (Array.isArray(plugins)) while (++index < plugins.length) {
					const thing = plugins[index];
					add(thing);
				}
				else throw new TypeError("Expected a list of plugins, not `" + plugins + "`");
			}
			/**
			* @param {Plugin} plugin
			* @param {Array<unknown>} parameters
			* @returns {undefined}
			*/
			function addPlugin(plugin, parameters) {
				let index = -1;
				let entryIndex = -1;
				while (++index < attachers.length) if (attachers[index][0] === plugin) {
					entryIndex = index;
					break;
				}
				if (entryIndex === -1) attachers.push([plugin, ...parameters]);
				else if (parameters.length > 0) {
					let [primary, ...rest] = parameters;
					const currentPrimary = attachers[entryIndex][1];
					if (isPlainObject(currentPrimary) && isPlainObject(primary)) primary = (0, import_extend.default)(true, currentPrimary, primary);
					attachers[entryIndex] = [
						plugin,
						primary,
						...rest
					];
				}
			}
		}
	}().freeze();
	/**
	* Assert a parser is available.
	*
	* @param {string} name
	* @param {unknown} value
	* @returns {asserts value is Parser}
	*/
	function assertParser(name, value) {
		if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `parser`");
	}
	/**
	* Assert a compiler is available.
	*
	* @param {string} name
	* @param {unknown} value
	* @returns {asserts value is Compiler}
	*/
	function assertCompiler(name, value) {
		if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `compiler`");
	}
	/**
	* Assert the processor is not frozen.
	*
	* @param {string} name
	* @param {unknown} frozen
	* @returns {asserts frozen is false}
	*/
	function assertUnfrozen(name, frozen) {
		if (frozen) throw new Error("Cannot call `" + name + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.");
	}
	/**
	* Assert `node` is a unist node.
	*
	* @param {unknown} node
	* @returns {asserts node is Node}
	*/
	function assertNode(node) {
		if (!isPlainObject(node) || typeof node.type !== "string") throw new TypeError("Expected node, got `" + node + "`");
	}
	/**
	* Assert that `complete` is `true`.
	*
	* @param {string} name
	* @param {string} asyncName
	* @param {unknown} complete
	* @returns {asserts complete is true}
	*/
	function assertDone(name, asyncName, complete) {
		if (!complete) throw new Error("`" + name + "` finished async. Use `" + asyncName + "` instead");
	}
	/**
	* @param {Compatible | undefined} [value]
	* @returns {VFile}
	*/
	function vfile(value) {
		return looksLikeAVFile(value) ? value : new VFile(value);
	}
	/**
	* @param {Compatible | undefined} [value]
	* @returns {value is VFile}
	*/
	function looksLikeAVFile(value) {
		return Boolean(value && typeof value === "object" && "message" in value && "messages" in value);
	}
	/**
	* @param {unknown} [value]
	* @returns {value is Value}
	*/
	function looksLikeAValue(value) {
		return typeof value === "string" || isUint8Array(value);
	}
	/**
	* Assert `value` is an `Uint8Array`.
	*
	* @param {unknown} value
	*   thing.
	* @returns {value is Uint8Array}
	*   Whether `value` is an `Uint8Array`.
	*/
	function isUint8Array(value) {
		return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
	}
	//#endregion
	//#region node_modules/prosemirror-unified/dist/prosemirror-unified.js
	function createProseMirrorNode(nodeName, schema, children, attrs = {}) {
		if (nodeName === null) return [];
		const proseMirrorNode = schema.nodes[nodeName].createAndFill(attrs, children);
		if (proseMirrorNode === null) return [];
		return [proseMirrorNode];
	}
	var Extension = class {
		dependencies() {
			return [];
		}
		unifiedInitializationHook(processor) {
			return processor;
		}
	};
	var SyntaxExtension = class extends Extension {
		postUnistToProseMirrorHook(context) {}
		proseMirrorInputRules(proseMirrorSchema) {
			return [];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			return {};
		}
		unistToProseMirrorTest(node) {
			return node.type === this.unistNodeName();
		}
	};
	var MarkExtension = class extends SyntaxExtension {};
	var MarkInputRule = class MarkInputRule extends InputRule$1 {
		constructor(matcher, markType) {
			super(matcher, (state, match, start, end) => this.markHandler(state, match, start, end));
			this.markType = markType;
		}
		static markApplies(doc, ranges, type) {
			for (const range of ranges) {
				const { $from, $to } = range;
				let applies = $from.depth === 0 ? doc.type.allowsMarkType(type) : false;
				doc.nodesBetween($from.pos, $to.pos, (node) => {
					if (applies) return false;
					applies = node.inlineContent && node.type.allowsMarkType(type);
					return true;
				});
				if (applies) return true;
			}
			return false;
		}
		markHandler(state, match, start, end) {
			var _a;
			const range = [new SelectionRange(state.doc.resolve(start), state.doc.resolve(end))];
			if (!MarkInputRule.markApplies(state.doc, range, this.markType)) return null;
			const newMarks = ((_a = state.doc.nodeAt(start)) == null ? void 0 : _a.marks.map((mark) => mark.type)) ?? [];
			newMarks.push(this.markType);
			const tr = state.tr.replaceWith(start, end, this.markType.schema.text(match[1]));
			for (const markType of newMarks) tr.addMark(tr.mapping.map(start), tr.mapping.map(end), markType.create(null));
			for (const markType of newMarks) tr.removeStoredMark(markType);
			if (match[2] !== "\n") tr.insertText(match[2]);
			return tr;
		}
	};
	var NodeExtension = class extends SyntaxExtension {
		proseMirrorNodeView() {
			return null;
		}
		proseMirrorToUnistTest(node) {
			return this.proseMirrorNodeName() === node.type.name;
		}
	};
	var ExtensionManager = class {
		constructor(extensions) {
			this.markExtensionList = /* @__PURE__ */ new Map();
			this.nodeExtensionList = /* @__PURE__ */ new Map();
			this.otherExtensionList = /* @__PURE__ */ new Map();
			for (const extension of extensions) this.add(extension);
		}
		extensions() {
			return this.syntaxExtensions().concat(Array.from(this.otherExtensionList.values()));
		}
		markExtensions() {
			return Array.from(this.markExtensionList.values());
		}
		nodeExtensions() {
			return Array.from(this.nodeExtensionList.values());
		}
		syntaxExtensions() {
			return this.nodeExtensions().concat(this.markExtensions());
		}
		add(extension) {
			for (const dependency of extension.dependencies()) this.add(dependency);
			if (isMarkExtension(extension)) {
				this.markExtensionList.set(extension.constructor.name, extension);
				return;
			}
			if (isNodeExtension(extension)) {
				this.nodeExtensionList.set(extension.constructor.name, extension);
				return;
			}
			this.otherExtensionList.set(extension.constructor.name, extension);
		}
	};
	function isMarkExtension(extension) {
		return extension instanceof MarkExtension;
	}
	function isNodeExtension(extension) {
		return extension instanceof NodeExtension;
	}
	var InputRulesBuilder = class {
		constructor(extensionManager, proseMirrorSchema) {
			this.rules = [].concat.apply([], extensionManager.syntaxExtensions().map((extension) => extension.proseMirrorInputRules(proseMirrorSchema)));
		}
		build() {
			var _a;
			const inputRulesPlugin = inputRules({ rules: this.rules });
			const originalHandleKeyDown = (_a = inputRulesPlugin.props.handleKeyDown) == null ? void 0 : _a.bind(inputRulesPlugin);
			inputRulesPlugin.props.handleKeyDown = (view, event) => {
				var _a2;
				if (event.key === "Enter") {
					const { from, to } = view.state.selection;
					(_a2 = inputRulesPlugin.props.handleTextInput) == null || _a2.call(inputRulesPlugin, view, from, to, "\n", () => view.state.tr.insertText("\n").scrollIntoView());
				}
				return originalHandleKeyDown == null ? void 0 : originalHandleKeyDown(view, event);
			};
			return inputRulesPlugin;
		}
	};
	var KeymapBuilder = class {
		constructor(extensionManager, proseMirrorSchema) {
			this.keymap = /* @__PURE__ */ new Map();
			for (const extension of extensionManager.syntaxExtensions()) this.addKeymap(extension.proseMirrorKeymap(proseMirrorSchema));
			this.addKeymap(baseKeymap);
		}
		build() {
			const chainedKeymap = {};
			this.keymap.forEach((commands, key) => {
				chainedKeymap[key] = chainCommands(...commands);
			});
			return keymap(chainedKeymap);
		}
		addKeymap(map) {
			for (const key in map) {
				if (!Object.prototype.hasOwnProperty.call(map, key)) continue;
				if (!this.keymap.get(key)) this.keymap.set(key, []);
				this.keymap.get(key).push(map[key]);
			}
		}
	};
	var NodeViewBuilder = class {
		constructor(extensionManager) {
			this.nodeViews = {};
			for (const extension of extensionManager.nodeExtensions()) {
				const proseMirrorNodeName = extension.proseMirrorNodeName();
				const proseMirrorNodeView = extension.proseMirrorNodeView();
				if (proseMirrorNodeName !== null && proseMirrorNodeView !== null) this.nodeViews[proseMirrorNodeName] = proseMirrorNodeView;
			}
		}
		build() {
			return this.nodeViews;
		}
	};
	var ProseMirrorToUnistConverter = class {
		constructor(extensionManager) {
			this.extensionManager = extensionManager;
		}
		convert(node) {
			const rootNode = this.convertNode(node);
			if (rootNode.length !== 1) throw new Error("Couldn't find any way to convert the root ProseMirror node.");
			return rootNode[0];
		}
		convertNode(node) {
			let convertedNodes = null;
			for (const extension of this.extensionManager.nodeExtensions()) {
				if (!extension.proseMirrorToUnistTest(node)) continue;
				let convertedChildren = [];
				for (let i = 0; i < node.childCount; ++i) convertedChildren = convertedChildren.concat(this.convertNode(node.child(i)));
				convertedNodes = extension.proseMirrorNodeToUnistNodes(node, convertedChildren);
			}
			if (convertedNodes === null) {
				console.warn(`Couldn't find any way to convert ProseMirror node of type "${node.type.name}" to a unist node.`);
				return [];
			}
			return convertedNodes.map((convertedNode) => {
				let postProcessedNode = convertedNode;
				for (const mark of node.marks) {
					let processed = false;
					for (const extension of this.extensionManager.markExtensions()) if (mark.type.name === extension.proseMirrorMarkName()) {
						postProcessedNode = extension.processConvertedUnistNode(postProcessedNode, mark);
						processed = true;
					}
					if (!processed) console.warn(`Couldn't find any way to convert ProseMirror mark of type "${mark.type.name}" to a unist node.`);
				}
				return postProcessedNode;
			});
		}
	};
	var SchemaBuilder = class {
		constructor(extensionManager) {
			this.marks = {};
			this.nodes = {};
			for (const extension of extensionManager.nodeExtensions()) {
				const name = extension.proseMirrorNodeName();
				const spec = extension.proseMirrorNodeSpec();
				if (name !== null && spec !== null) this.nodes[name] = spec;
			}
			for (const extension of extensionManager.markExtensions()) {
				const name = extension.proseMirrorMarkName();
				const spec = extension.proseMirrorMarkSpec();
				if (name !== null && spec !== null) this.marks[name] = spec;
			}
		}
		build() {
			return new Schema({
				marks: this.marks,
				nodes: this.nodes
			});
		}
	};
	var UnifiedBuilder = class {
		constructor(extensionManager) {
			this.extensionManager = extensionManager;
		}
		build() {
			let processor = unified();
			for (const extension of this.extensionManager.extensions()) processor = extension.unifiedInitializationHook(processor);
			return processor;
		}
	};
	var UnistToProseMirrorConverter = class UnistToProseMirrorConverter {
		constructor(extensionManager, proseMirrorSchema) {
			this.extensionManager = extensionManager;
			this.proseMirrorSchema = proseMirrorSchema;
		}
		static unistNodeIsParent(node) {
			return "children" in node;
		}
		convert(unist) {
			const context = {};
			const rootNode = this.convertNode(unist, context);
			for (const extension of this.extensionManager.syntaxExtensions()) extension.postUnistToProseMirrorHook(context);
			if (rootNode.length !== 1) throw new Error("Couldn't find any way to convert the root unist node.");
			return rootNode[0];
		}
		convertNode(node, context) {
			for (const extension of this.extensionManager.syntaxExtensions()) {
				if (!extension.unistToProseMirrorTest(node)) continue;
				let convertedChildren = [];
				if (UnistToProseMirrorConverter.unistNodeIsParent(node)) convertedChildren = [].concat.apply([], node.children.map((child) => this.convertNode(child, context)));
				return extension.unistNodeToProseMirrorNodes(node, this.proseMirrorSchema, convertedChildren, context);
			}
			console.warn(`Couldn't find any way to convert unist node of type "${node.type}" to a ProseMirror node.`);
			return [];
		}
	};
	var ProseMirrorUnified = class {
		constructor(extensions = []) {
			const extensionManager = new ExtensionManager(extensions);
			this.builtSchema = new SchemaBuilder(extensionManager).build();
			this.inputRulesBuilder = new InputRulesBuilder(extensionManager, this.builtSchema);
			this.keymapBuilder = new KeymapBuilder(extensionManager, this.builtSchema);
			this.nodeViewBuilder = new NodeViewBuilder(extensionManager);
			this.unistToProseMirrorConverter = new UnistToProseMirrorConverter(extensionManager, this.builtSchema);
			this.proseMirrorToUnistConverter = new ProseMirrorToUnistConverter(extensionManager);
			this.unified = new UnifiedBuilder(extensionManager).build();
		}
		inputRulesPlugin() {
			return this.inputRulesBuilder.build();
		}
		keymapPlugin() {
			return this.keymapBuilder.build();
		}
		nodeViews() {
			return this.nodeViewBuilder.build();
		}
		parse(source) {
			const unist = this.unified.runSync(this.unified.parse(source));
			return this.unistToProseMirrorConverter.convert(unist);
		}
		schema() {
			return this.builtSchema;
		}
		serialize(doc) {
			const unist = this.proseMirrorToUnistConverter.convert(doc);
			return this.unified.stringify(unist);
		}
	};
	//#endregion
	//#region node_modules/mdast-util-to-string/lib/index.js
	/**
	* @typedef {import('mdast').Nodes} Nodes
	*
	* @typedef Options
	*   Configuration (optional).
	* @property {boolean | null | undefined} [includeImageAlt=true]
	*   Whether to use `alt` for `image`s (default: `true`).
	* @property {boolean | null | undefined} [includeHtml=true]
	*   Whether to use `value` of HTML (default: `true`).
	*/
	/** @type {Options} */
	var emptyOptions$1 = {};
	/**
	* Get the text content of a node or list of nodes.
	*
	* Prefers the node’s plain-text fields, otherwise serializes its children,
	* and if the given value is an array, serialize the nodes in it.
	*
	* @param {unknown} [value]
	*   Thing to serialize, typically `Node`.
	* @param {Options | null | undefined} [options]
	*   Configuration (optional).
	* @returns {string}
	*   Serialized `value`.
	*/
	function toString$1(value, options) {
		const settings = options || emptyOptions$1;
		return one$1(value, typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true, typeof settings.includeHtml === "boolean" ? settings.includeHtml : true);
	}
	/**
	* One node or several nodes.
	*
	* @param {unknown} value
	*   Thing to serialize.
	* @param {boolean} includeImageAlt
	*   Include image `alt`s.
	* @param {boolean} includeHtml
	*   Include HTML.
	* @returns {string}
	*   Serialized node.
	*/
	function one$1(value, includeImageAlt, includeHtml) {
		if (node$1(value)) {
			if ("value" in value) return value.type === "html" && !includeHtml ? "" : value.value;
			if (includeImageAlt && "alt" in value && value.alt) return value.alt;
			if ("children" in value) return all$1(value.children, includeImageAlt, includeHtml);
		}
		if (Array.isArray(value)) return all$1(value, includeImageAlt, includeHtml);
		return "";
	}
	/**
	* Serialize a list of nodes.
	*
	* @param {Array<unknown>} values
	*   Thing to serialize.
	* @param {boolean} includeImageAlt
	*   Include image `alt`s.
	* @param {boolean} includeHtml
	*   Include HTML.
	* @returns {string}
	*   Serialized nodes.
	*/
	function all$1(values, includeImageAlt, includeHtml) {
		/** @type {Array<string>} */
		const result = [];
		let index = -1;
		while (++index < values.length) result[index] = one$1(values[index], includeImageAlt, includeHtml);
		return result.join("");
	}
	/**
	* Check if `value` looks like a node.
	*
	* @param {unknown} value
	*   Thing.
	* @returns {value is Nodes}
	*   Whether `value` is a node.
	*/
	function node$1(value) {
		return Boolean(value && typeof value === "object");
	}
	//#endregion
	//#region node_modules/decode-named-character-reference/index.dom.js
	var element = document.createElement("i");
	/**
	* @param {string} value
	* @returns {string | false}
	*/
	function decodeNamedCharacterReference(value) {
		const characterReference = "&" + value + ";";
		element.innerHTML = characterReference;
		const character = element.textContent;
		if (character.charCodeAt(character.length - 1) === 59 && value !== "semi") return false;
		return character === characterReference ? false : character;
	}
	//#endregion
	//#region node_modules/micromark-util-chunked/index.js
	/**
	* Like `Array#splice`, but smarter for giant arrays.
	*
	* `Array#splice` takes all items to be inserted as individual argument which
	* causes a stack overflow in V8 when trying to insert 100k items for instance.
	*
	* Otherwise, this does not return the removed items, and takes `items` as an
	* array instead of rest parameters.
	*
	* @template {unknown} T
	*   Item type.
	* @param {Array<T>} list
	*   List to operate on.
	* @param {number} start
	*   Index to remove/insert at (can be negative).
	* @param {number} remove
	*   Number of items to remove.
	* @param {Array<T>} items
	*   Items to inject into `list`.
	* @returns {undefined}
	*   Nothing.
	*/
	function splice$1(list, start, remove, items) {
		const end = list.length;
		let chunkStart = 0;
		/** @type {Array<unknown>} */
		let parameters;
		if (start < 0) start = -start > end ? 0 : end + start;
		else start = start > end ? end : start;
		remove = remove > 0 ? remove : 0;
		if (items.length < 1e4) {
			parameters = Array.from(items);
			parameters.unshift(start, remove);
			list.splice(...parameters);
		} else {
			if (remove) list.splice(start, remove);
			while (chunkStart < items.length) {
				parameters = items.slice(chunkStart, chunkStart + 1e4);
				parameters.unshift(start, 0);
				list.splice(...parameters);
				chunkStart += 1e4;
				start += 1e4;
			}
		}
	}
	/**
	* Append `items` (an array) at the end of `list` (another array).
	* When `list` was empty, returns `items` instead.
	*
	* This prevents a potentially expensive operation when `list` is empty,
	* and adds items in batches to prevent V8 from hanging.
	*
	* @template {unknown} T
	*   Item type.
	* @param {Array<T>} list
	*   List to operate on.
	* @param {Array<T>} items
	*   Items to add to `list`.
	* @returns {Array<T>}
	*   Either `list` or `items`.
	*/
	function push(list, items) {
		if (list.length > 0) {
			splice$1(list, list.length, 0, items);
			return list;
		}
		return items;
	}
	//#endregion
	//#region node_modules/micromark-util-combine-extensions/index.js
	/**
	* @import {
	*   Extension,
	*   Handles,
	*   HtmlExtension,
	*   NormalizedExtension
	* } from 'micromark-util-types'
	*/
	var hasOwnProperty = {}.hasOwnProperty;
	/**
	* Combine multiple syntax extensions into one.
	*
	* @param {ReadonlyArray<Extension>} extensions
	*   List of syntax extensions.
	* @returns {NormalizedExtension}
	*   A single combined extension.
	*/
	function combineExtensions(extensions) {
		/** @type {NormalizedExtension} */
		const all = {};
		let index = -1;
		while (++index < extensions.length) syntaxExtension(all, extensions[index]);
		return all;
	}
	/**
	* Merge `extension` into `all`.
	*
	* @param {NormalizedExtension} all
	*   Extension to merge into.
	* @param {Extension} extension
	*   Extension to merge.
	* @returns {undefined}
	*   Nothing.
	*/
	function syntaxExtension(all, extension) {
		/** @type {keyof Extension} */
		let hook;
		for (hook in extension) {
			/** @type {Record<string, unknown>} */
			const left = (hasOwnProperty.call(all, hook) ? all[hook] : void 0) || (all[hook] = {});
			/** @type {Record<string, unknown> | undefined} */
			const right = extension[hook];
			/** @type {string} */
			let code;
			if (right) for (code in right) {
				if (!hasOwnProperty.call(left, code)) left[code] = [];
				const value = right[code];
				constructs(left[code], Array.isArray(value) ? value : value ? [value] : []);
			}
		}
	}
	/**
	* Merge `list` into `existing` (both lists of constructs).
	* Mutates `existing`.
	*
	* @param {Array<unknown>} existing
	*   List of constructs to merge into.
	* @param {Array<unknown>} list
	*   List of constructs to merge.
	* @returns {undefined}
	*   Nothing.
	*/
	function constructs(existing, list) {
		let index = -1;
		/** @type {Array<unknown>} */
		const before = [];
		while (++index < list.length) (list[index].add === "after" ? existing : before).push(list[index]);
		splice$1(existing, 0, 0, before);
	}
	//#endregion
	//#region node_modules/micromark-util-decode-numeric-character-reference/index.js
	/**
	* Turn the number (in string form as either hexa- or plain decimal) coming from
	* a numeric character reference into a character.
	*
	* Sort of like `String.fromCodePoint(Number.parseInt(value, base))`, but makes
	* non-characters and control characters safe.
	*
	* @param {string} value
	*   Value to decode.
	* @param {number} base
	*   Numeric base.
	* @returns {string}
	*   Character.
	*/
	function decodeNumericCharacterReference(value, base) {
		const code = Number.parseInt(value, base);
		if (code < 9 || code === 11 || code > 13 && code < 32 || code > 126 && code < 160 || code > 55295 && code < 57344 || code > 64975 && code < 65008 || (code & 65535) === 65535 || (code & 65535) === 65534 || code > 1114111) return "�";
		return String.fromCodePoint(code);
	}
	//#endregion
	//#region node_modules/micromark-util-normalize-identifier/index.js
	/**
	* Normalize an identifier (as found in references, definitions).
	*
	* Collapses markdown whitespace, trim, and then lower- and uppercase.
	*
	* Some characters are considered “uppercase”, such as U+03F4 (`ϴ`), but if their
	* lowercase counterpart (U+03B8 (`θ`)) is uppercased will result in a different
	* uppercase character (U+0398 (`Θ`)).
	* So, to get a canonical form, we perform both lower- and uppercase.
	*
	* Using uppercase last makes sure keys will never interact with default
	* prototypal values (such as `constructor`): nothing in the prototype of
	* `Object` is uppercase.
	*
	* @param {string} value
	*   Identifier to normalize.
	* @returns {string}
	*   Normalized identifier.
	*/
	function normalizeIdentifier(value) {
		return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
	}
	//#endregion
	//#region node_modules/micromark-util-character/index.js
	/**
	* @import {Code} from 'micromark-util-types'
	*/
	/**
	* Check whether the character code represents an ASCII alpha (`a` through `z`,
	* case insensitive).
	*
	* An **ASCII alpha** is an ASCII upper alpha or ASCII lower alpha.
	*
	* An **ASCII upper alpha** is a character in the inclusive range U+0041 (`A`)
	* to U+005A (`Z`).
	*
	* An **ASCII lower alpha** is a character in the inclusive range U+0061 (`a`)
	* to U+007A (`z`).
	*
	* @param code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	var asciiAlpha$1 = regexCheck$1(/[A-Za-z]/);
	/**
	* Check whether the character code represents an ASCII alphanumeric (`a`
	* through `z`, case insensitive, or `0` through `9`).
	*
	* An **ASCII alphanumeric** is an ASCII digit (see `asciiDigit`) or ASCII alpha
	* (see `asciiAlpha`).
	*
	* @param code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	var asciiAlphanumeric$1 = regexCheck$1(/[\dA-Za-z]/);
	/**
	* Check whether the character code represents an ASCII atext.
	*
	* atext is an ASCII alphanumeric (see `asciiAlphanumeric`), or a character in
	* the inclusive ranges U+0023 NUMBER SIGN (`#`) to U+0027 APOSTROPHE (`'`),
	* U+002A ASTERISK (`*`), U+002B PLUS SIGN (`+`), U+002D DASH (`-`), U+002F
	* SLASH (`/`), U+003D EQUALS TO (`=`), U+003F QUESTION MARK (`?`), U+005E
	* CARET (`^`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE
	* (`{`) to U+007E TILDE (`~`).
	*
	* See:
	* **\[RFC5322]**:
	* [Internet Message Format](https://tools.ietf.org/html/rfc5322).
	* P. Resnick.
	* IETF.
	*
	* @param code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	var asciiAtext = regexCheck$1(/[#-'*+\--9=?A-Z^-~]/);
	/**
	* Check whether a character code is an ASCII control character.
	*
	* An **ASCII control** is a character in the inclusive range U+0000 NULL (NUL)
	* to U+001F (US), or U+007F (DEL).
	*
	* @param {Code} code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	function asciiControl$1(code) {
		return code !== null && (code < 32 || code === 127);
	}
	/**
	* Check whether the character code represents an ASCII digit (`0` through `9`).
	*
	* An **ASCII digit** is a character in the inclusive range U+0030 (`0`) to
	* U+0039 (`9`).
	*
	* @param code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	var asciiDigit = regexCheck$1(/\d/);
	/**
	* Check whether the character code represents an ASCII hex digit (`a` through
	* `f`, case insensitive, or `0` through `9`).
	*
	* An **ASCII hex digit** is an ASCII digit (see `asciiDigit`), ASCII upper hex
	* digit, or an ASCII lower hex digit.
	*
	* An **ASCII upper hex digit** is a character in the inclusive range U+0041
	* (`A`) to U+0046 (`F`).
	*
	* An **ASCII lower hex digit** is a character in the inclusive range U+0061
	* (`a`) to U+0066 (`f`).
	*
	* @param code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	var asciiHexDigit = regexCheck$1(/[\dA-Fa-f]/);
	/**
	* Check whether the character code represents ASCII punctuation.
	*
	* An **ASCII punctuation** is a character in the inclusive ranges U+0021
	* EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`) to U+0040 AT
	* SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT
	* (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).
	*
	* @param code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	var asciiPunctuation = regexCheck$1(/[!-/:-@[-`{-~]/);
	/**
	* Check whether a character code is a markdown line ending.
	*
	* A **markdown line ending** is the virtual characters M-0003 CARRIAGE RETURN
	* LINE FEED (CRLF), M-0004 LINE FEED (LF) and M-0005 CARRIAGE RETURN (CR).
	*
	* In micromark, the actual character U+000A LINE FEED (LF) and U+000D CARRIAGE
	* RETURN (CR) are replaced by these virtual characters depending on whether
	* they occurred together.
	*
	* @param {Code} code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	function markdownLineEnding$1(code) {
		return code !== null && code < -2;
	}
	/**
	* Check whether a character code is a markdown line ending (see
	* `markdownLineEnding`) or markdown space (see `markdownSpace`).
	*
	* @param {Code} code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	function markdownLineEndingOrSpace$1(code) {
		return code !== null && (code < 0 || code === 32);
	}
	/**
	* Check whether a character code is a markdown space.
	*
	* A **markdown space** is the concrete character U+0020 SPACE (SP) and the
	* virtual characters M-0001 VIRTUAL SPACE (VS) and M-0002 HORIZONTAL TAB (HT).
	*
	* In micromark, the actual character U+0009 CHARACTER TABULATION (HT) is
	* replaced by one M-0002 HORIZONTAL TAB (HT) and between 0 and 3 M-0001 VIRTUAL
	* SPACE (VS) characters, depending on the column at which the tab occurred.
	*
	* @param {Code} code
	*   Code.
	* @returns {boolean}
	*   Whether it matches.
	*/
	function markdownSpace$1(code) {
		return code === -2 || code === -1 || code === 32;
	}
	/**
	* Check whether the character code represents Unicode punctuation.
	*
	* A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
	* Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
	* (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
	* (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
	* punctuation (see `asciiPunctuation`).
	*
	* See:
	* **\[UNICODE]**:
	* [The Unicode Standard](https://www.unicode.org/versions/).
	* Unicode Consortium.
	*
	* @param code
	*   Code.
	* @returns
	*   Whether it matches.
	*/
	var unicodePunctuation$1 = regexCheck$1(/\p{P}|\p{S}/u);
	/**
	* Check whether the character code represents Unicode whitespace.
	*
	* Note that this does handle micromark specific markdown whitespace characters.
	* See `markdownLineEndingOrSpace` to check that.
	*
	* A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
	* Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
	* U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
	*
	* See:
	* **\[UNICODE]**:
	* [The Unicode Standard](https://www.unicode.org/versions/).
	* Unicode Consortium.
	*
	* @param code
	*   Code.
	* @returns
	*   Whether it matches.
	*/
	var unicodeWhitespace$1 = regexCheck$1(/\s/);
	/**
	* Create a code check from a regex.
	*
	* @param {RegExp} regex
	*   Expression.
	* @returns {(code: Code) => boolean}
	*   Check.
	*/
	function regexCheck$1(regex) {
		return check;
		/**
		* Check whether a code matches the bound regex.
		*
		* @param {Code} code
		*   Character code.
		* @returns {boolean}
		*   Whether the character code matches the bound regex.
		*/
		function check(code) {
			return code !== null && code > -1 && regex.test(String.fromCharCode(code));
		}
	}
	//#endregion
	//#region node_modules/micromark-factory-space/index.js
	/**
	* @import {Effects, State, TokenType} from 'micromark-util-types'
	*/
	/**
	* Parse spaces and tabs.
	*
	* There is no `nok` parameter:
	*
	* *   spaces in markdown are often optional, in which case this factory can be
	*     used and `ok` will be switched to whether spaces were found or not
	* *   one line ending or space can be detected with `markdownSpace(code)` right
	*     before using `factorySpace`
	*
	* ###### Examples
	*
	* Where `␉` represents a tab (plus how much it expands) and `␠` represents a
	* single space.
	*
	* ```markdown
	* ␉
	* ␠␠␠␠
	* ␉␠
	* ```
	*
	* @param {Effects} effects
	*   Context.
	* @param {State} ok
	*   State switched to when successful.
	* @param {TokenType} type
	*   Type (`' \t'`).
	* @param {number | undefined} [max=Infinity]
	*   Max (exclusive).
	* @returns {State}
	*   Start state.
	*/
	function factorySpace$1(effects, ok, type, max) {
		const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
		let size = 0;
		return start;
		/** @type {State} */
		function start(code) {
			if (markdownSpace$1(code)) {
				effects.enter(type);
				return prefix(code);
			}
			return ok(code);
		}
		/** @type {State} */
		function prefix(code) {
			if (markdownSpace$1(code) && size++ < limit) {
				effects.consume(code);
				return prefix;
			}
			effects.exit(type);
			return ok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark/lib/initialize/content.js
	/**
	* @import {
	*   InitialConstruct,
	*   Initializer,
	*   State,
	*   TokenizeContext,
	*   Token
	* } from 'micromark-util-types'
	*/
	/** @type {InitialConstruct} */
	var content$1 = { tokenize: initializeContent };
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Initializer}
	*   Content.
	*/
	function initializeContent(effects) {
		const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
		/** @type {Token} */
		let previous;
		return contentStart;
		/** @type {State} */
		function afterContentStartConstruct(code) {
			if (code === null) {
				effects.consume(code);
				return;
			}
			effects.enter("lineEnding");
			effects.consume(code);
			effects.exit("lineEnding");
			return factorySpace$1(effects, contentStart, "linePrefix");
		}
		/** @type {State} */
		function paragraphInitial(code) {
			effects.enter("paragraph");
			return lineStart(code);
		}
		/** @type {State} */
		function lineStart(code) {
			const token = effects.enter("chunkText", {
				contentType: "text",
				previous
			});
			if (previous) previous.next = token;
			previous = token;
			return data(code);
		}
		/** @type {State} */
		function data(code) {
			if (code === null) {
				effects.exit("chunkText");
				effects.exit("paragraph");
				effects.consume(code);
				return;
			}
			if (markdownLineEnding$1(code)) {
				effects.consume(code);
				effects.exit("chunkText");
				return lineStart;
			}
			effects.consume(code);
			return data;
		}
	}
	//#endregion
	//#region node_modules/micromark/lib/initialize/document.js
	/**
	* @import {
	*   Construct,
	*   ContainerState,
	*   InitialConstruct,
	*   Initializer,
	*   Point,
	*   State,
	*   TokenizeContext,
	*   Tokenizer,
	*   Token
	* } from 'micromark-util-types'
	*/
	/**
	* @typedef {[Construct, ContainerState]} StackItem
	*   Construct and its state.
	*/
	/** @type {InitialConstruct} */
	var document$2 = { tokenize: initializeDocument };
	/** @type {Construct} */
	var containerConstruct = { tokenize: tokenizeContainer };
	/**
	* @this {TokenizeContext}
	*   Self.
	* @type {Initializer}
	*   Initializer.
	*/
	function initializeDocument(effects) {
		const self = this;
		/** @type {Array<StackItem>} */
		const stack = [];
		let continued = 0;
		/** @type {TokenizeContext | undefined} */
		let childFlow;
		/** @type {Token | undefined} */
		let childToken;
		/** @type {number} */
		let lineStartOffset;
		return start;
		/** @type {State} */
		function start(code) {
			if (continued < stack.length) {
				const item = stack[continued];
				self.containerState = item[1];
				return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code);
			}
			return checkNewContainers(code);
		}
		/** @type {State} */
		function documentContinue(code) {
			continued++;
			if (self.containerState._closeFlow) {
				self.containerState._closeFlow = void 0;
				if (childFlow) closeFlow();
				const indexBeforeExits = self.events.length;
				let indexBeforeFlow = indexBeforeExits;
				/** @type {Point | undefined} */
				let point;
				while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
					point = self.events[indexBeforeFlow][1].end;
					break;
				}
				exitContainers(continued);
				let index = indexBeforeExits;
				while (index < self.events.length) {
					self.events[index][1].end = { ...point };
					index++;
				}
				splice$1(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
				self.events.length = index;
				return checkNewContainers(code);
			}
			return start(code);
		}
		/** @type {State} */
		function checkNewContainers(code) {
			if (continued === stack.length) {
				if (!childFlow) return documentContinued(code);
				if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) return flowStart(code);
				self.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
			}
			self.containerState = {};
			return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code);
		}
		/** @type {State} */
		function thereIsANewContainer(code) {
			if (childFlow) closeFlow();
			exitContainers(continued);
			return documentContinued(code);
		}
		/** @type {State} */
		function thereIsNoNewContainer(code) {
			self.parser.lazy[self.now().line] = continued !== stack.length;
			lineStartOffset = self.now().offset;
			return flowStart(code);
		}
		/** @type {State} */
		function documentContinued(code) {
			self.containerState = {};
			return effects.attempt(containerConstruct, containerContinue, flowStart)(code);
		}
		/** @type {State} */
		function containerContinue(code) {
			continued++;
			stack.push([self.currentConstruct, self.containerState]);
			return documentContinued(code);
		}
		/** @type {State} */
		function flowStart(code) {
			if (code === null) {
				if (childFlow) closeFlow();
				exitContainers(0);
				effects.consume(code);
				return;
			}
			childFlow = childFlow || self.parser.flow(self.now());
			effects.enter("chunkFlow", {
				_tokenizer: childFlow,
				contentType: "flow",
				previous: childToken
			});
			return flowContinue(code);
		}
		/** @type {State} */
		function flowContinue(code) {
			if (code === null) {
				writeToChild(effects.exit("chunkFlow"), true);
				exitContainers(0);
				effects.consume(code);
				return;
			}
			if (markdownLineEnding$1(code)) {
				effects.consume(code);
				writeToChild(effects.exit("chunkFlow"));
				continued = 0;
				self.interrupt = void 0;
				return start;
			}
			effects.consume(code);
			return flowContinue;
		}
		/**
		* @param {Token} token
		*   Token.
		* @param {boolean | undefined} [endOfFile]
		*   Whether the token is at the end of the file (default: `false`).
		* @returns {undefined}
		*   Nothing.
		*/
		function writeToChild(token, endOfFile) {
			const stream = self.sliceStream(token);
			if (endOfFile) stream.push(null);
			token.previous = childToken;
			if (childToken) childToken.next = token;
			childToken = token;
			childFlow.defineSkip(token.start);
			childFlow.write(stream);
			if (self.parser.lazy[token.start.line]) {
				let index = childFlow.events.length;
				while (index--) if (childFlow.events[index][1].start.offset < lineStartOffset && (!childFlow.events[index][1].end || childFlow.events[index][1].end.offset > lineStartOffset)) return;
				const indexBeforeExits = self.events.length;
				let indexBeforeFlow = indexBeforeExits;
				/** @type {boolean | undefined} */
				let seen;
				/** @type {Point | undefined} */
				let point;
				while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
					if (seen) {
						point = self.events[indexBeforeFlow][1].end;
						break;
					}
					seen = true;
				}
				exitContainers(continued);
				index = indexBeforeExits;
				while (index < self.events.length) {
					self.events[index][1].end = { ...point };
					index++;
				}
				splice$1(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
				self.events.length = index;
			}
		}
		/**
		* @param {number} size
		*   Size.
		* @returns {undefined}
		*   Nothing.
		*/
		function exitContainers(size) {
			let index = stack.length;
			while (index-- > size) {
				const entry = stack[index];
				self.containerState = entry[1];
				entry[0].exit.call(self, effects);
			}
			stack.length = size;
		}
		function closeFlow() {
			childFlow.write([null]);
			childToken = void 0;
			childFlow = void 0;
			self.containerState._closeFlow = void 0;
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*   Tokenizer.
	*/
	function tokenizeContainer(effects, ok, nok) {
		return factorySpace$1(effects, effects.attempt(this.parser.constructs.document, ok, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
	}
	//#endregion
	//#region node_modules/micromark-util-classify-character/index.js
	/**
	* @import {Code} from 'micromark-util-types'
	*/
	/**
	* Classify whether a code represents whitespace, punctuation, or something
	* else.
	*
	* Used for attention (emphasis, strong), whose sequences can open or close
	* based on the class of surrounding characters.
	*
	* > 👉 **Note**: eof (`null`) is seen as whitespace.
	*
	* @param {Code} code
	*   Code.
	* @returns {typeof constants.characterGroupWhitespace | typeof constants.characterGroupPunctuation | undefined}
	*   Group.
	*/
	function classifyCharacter$1(code) {
		if (code === null || markdownLineEndingOrSpace$1(code) || unicodeWhitespace$1(code)) return 1;
		if (unicodePunctuation$1(code)) return 2;
	}
	//#endregion
	//#region node_modules/micromark-util-resolve-all/index.js
	/**
	* @import {Event, Resolver, TokenizeContext} from 'micromark-util-types'
	*/
	/**
	* Call all `resolveAll`s.
	*
	* @param {ReadonlyArray<{resolveAll?: Resolver | undefined}>} constructs
	*   List of constructs, optionally with `resolveAll`s.
	* @param {Array<Event>} events
	*   List of events.
	* @param {TokenizeContext} context
	*   Context used by `tokenize`.
	* @returns {Array<Event>}
	*   Changed events.
	*/
	function resolveAll$1(constructs, events, context) {
		/** @type {Array<Resolver>} */
		const called = [];
		let index = -1;
		while (++index < constructs.length) {
			const resolve = constructs[index].resolveAll;
			if (resolve && !called.includes(resolve)) {
				events = resolve(events, context);
				called.push(resolve);
			}
		}
		return events;
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/attention.js
	/**
	* @import {
	*   Code,
	*   Construct,
	*   Event,
	*   Point,
	*   Resolver,
	*   State,
	*   TokenizeContext,
	*   Tokenizer,
	*   Token
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var attention = {
		name: "attention",
		resolveAll: resolveAllAttention,
		tokenize: tokenizeAttention
	};
	/**
	* Take all events and resolve attention to emphasis or strong.
	*
	* @type {Resolver}
	*/
	function resolveAllAttention(events, context) {
		let index = -1;
		/** @type {number} */
		let open;
		/** @type {Token} */
		let group;
		/** @type {Token} */
		let text;
		/** @type {Token} */
		let openingSequence;
		/** @type {Token} */
		let closingSequence;
		/** @type {number} */
		let use;
		/** @type {Array<Event>} */
		let nextEvents;
		/** @type {number} */
		let offset;
		while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "attentionSequence" && events[index][1]._close) {
			open = index;
			while (open--) if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index][1]).charCodeAt(0)) {
				if ((events[open][1]._close || events[index][1]._open) && (events[index][1].end.offset - events[index][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index][1].end.offset - events[index][1].start.offset) % 3)) continue;
				use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index][1].end.offset - events[index][1].start.offset > 1 ? 2 : 1;
				const start = { ...events[open][1].end };
				const end = { ...events[index][1].start };
				movePoint(start, -use);
				movePoint(end, use);
				openingSequence = {
					type: use > 1 ? "strongSequence" : "emphasisSequence",
					start,
					end: { ...events[open][1].end }
				};
				closingSequence = {
					type: use > 1 ? "strongSequence" : "emphasisSequence",
					start: { ...events[index][1].start },
					end
				};
				text = {
					type: use > 1 ? "strongText" : "emphasisText",
					start: { ...events[open][1].end },
					end: { ...events[index][1].start }
				};
				group = {
					type: use > 1 ? "strong" : "emphasis",
					start: { ...openingSequence.start },
					end: { ...closingSequence.end }
				};
				events[open][1].end = { ...openingSequence.start };
				events[index][1].start = { ...closingSequence.end };
				nextEvents = [];
				if (events[open][1].end.offset - events[open][1].start.offset) nextEvents = push(nextEvents, [[
					"enter",
					events[open][1],
					context
				], [
					"exit",
					events[open][1],
					context
				]]);
				nextEvents = push(nextEvents, [
					[
						"enter",
						group,
						context
					],
					[
						"enter",
						openingSequence,
						context
					],
					[
						"exit",
						openingSequence,
						context
					],
					[
						"enter",
						text,
						context
					]
				]);
				nextEvents = push(nextEvents, resolveAll$1(context.parser.constructs.insideSpan.null, events.slice(open + 1, index), context));
				nextEvents = push(nextEvents, [
					[
						"exit",
						text,
						context
					],
					[
						"enter",
						closingSequence,
						context
					],
					[
						"exit",
						closingSequence,
						context
					],
					[
						"exit",
						group,
						context
					]
				]);
				if (events[index][1].end.offset - events[index][1].start.offset) {
					offset = 2;
					nextEvents = push(nextEvents, [[
						"enter",
						events[index][1],
						context
					], [
						"exit",
						events[index][1],
						context
					]]);
				} else offset = 0;
				splice$1(events, open - 1, index - open + 3, nextEvents);
				index = open + nextEvents.length - offset - 2;
				break;
			}
		}
		index = -1;
		while (++index < events.length) if (events[index][1].type === "attentionSequence") events[index][1].type = "data";
		return events;
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeAttention(effects, ok) {
		const attentionMarkers = this.parser.constructs.attentionMarkers.null;
		const previous = this.previous;
		const before = classifyCharacter$1(previous);
		/** @type {NonNullable<Code>} */
		let marker;
		return start;
		/**
		* Before a sequence.
		*
		* ```markdown
		* > | **
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			marker = code;
			effects.enter("attentionSequence");
			return inside(code);
		}
		/**
		* In a sequence.
		*
		* ```markdown
		* > | **
		*     ^^
		* ```
		*
		* @type {State}
		*/
		function inside(code) {
			if (code === marker) {
				effects.consume(code);
				return inside;
			}
			const token = effects.exit("attentionSequence");
			const after = classifyCharacter$1(code);
			const open = !after || after === 2 && before || attentionMarkers.includes(code);
			const close = !before || before === 2 && after || attentionMarkers.includes(previous);
			token._open = Boolean(marker === 42 ? open : open && (before || !close));
			token._close = Boolean(marker === 42 ? close : close && (after || !open));
			return ok(code);
		}
	}
	/**
	* Move a point a bit.
	*
	* Note: `move` only works inside lines! It’s not possible to move past other
	* chunks (replacement characters, tabs, or line endings).
	*
	* @param {Point} point
	*   Point.
	* @param {number} offset
	*   Amount to move.
	* @returns {undefined}
	*   Nothing.
	*/
	function movePoint(point, offset) {
		point.column += offset;
		point.offset += offset;
		point._bufferIndex += offset;
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/autolink.js
	/**
	* @import {
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var autolink = {
		name: "autolink",
		tokenize: tokenizeAutolink
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeAutolink(effects, ok, nok) {
		let size = 0;
		return start;
		/**
		* Start of an autolink.
		*
		* ```markdown
		* > | a<https://example.com>b
		*      ^
		* > | a<user@example.com>b
		*      ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("autolink");
			effects.enter("autolinkMarker");
			effects.consume(code);
			effects.exit("autolinkMarker");
			effects.enter("autolinkProtocol");
			return open;
		}
		/**
		* After `<`, at protocol or atext.
		*
		* ```markdown
		* > | a<https://example.com>b
		*       ^
		* > | a<user@example.com>b
		*       ^
		* ```
		*
		* @type {State}
		*/
		function open(code) {
			if (asciiAlpha$1(code)) {
				effects.consume(code);
				return schemeOrEmailAtext;
			}
			if (code === 64) return nok(code);
			return emailAtext(code);
		}
		/**
		* At second byte of protocol or atext.
		*
		* ```markdown
		* > | a<https://example.com>b
		*        ^
		* > | a<user@example.com>b
		*        ^
		* ```
		*
		* @type {State}
		*/
		function schemeOrEmailAtext(code) {
			if (code === 43 || code === 45 || code === 46 || asciiAlphanumeric$1(code)) {
				size = 1;
				return schemeInsideOrEmailAtext(code);
			}
			return emailAtext(code);
		}
		/**
		* In ambiguous protocol or atext.
		*
		* ```markdown
		* > | a<https://example.com>b
		*        ^
		* > | a<user@example.com>b
		*        ^
		* ```
		*
		* @type {State}
		*/
		function schemeInsideOrEmailAtext(code) {
			if (code === 58) {
				effects.consume(code);
				size = 0;
				return urlInside;
			}
			if ((code === 43 || code === 45 || code === 46 || asciiAlphanumeric$1(code)) && size++ < 32) {
				effects.consume(code);
				return schemeInsideOrEmailAtext;
			}
			size = 0;
			return emailAtext(code);
		}
		/**
		* After protocol, in URL.
		*
		* ```markdown
		* > | a<https://example.com>b
		*             ^
		* ```
		*
		* @type {State}
		*/
		function urlInside(code) {
			if (code === 62) {
				effects.exit("autolinkProtocol");
				effects.enter("autolinkMarker");
				effects.consume(code);
				effects.exit("autolinkMarker");
				effects.exit("autolink");
				return ok;
			}
			if (code === null || code === 32 || code === 60 || asciiControl$1(code)) return nok(code);
			effects.consume(code);
			return urlInside;
		}
		/**
		* In email atext.
		*
		* ```markdown
		* > | a<user.name@example.com>b
		*              ^
		* ```
		*
		* @type {State}
		*/
		function emailAtext(code) {
			if (code === 64) {
				effects.consume(code);
				return emailAtSignOrDot;
			}
			if (asciiAtext(code)) {
				effects.consume(code);
				return emailAtext;
			}
			return nok(code);
		}
		/**
		* In label, after at-sign or dot.
		*
		* ```markdown
		* > | a<user.name@example.com>b
		*                 ^       ^
		* ```
		*
		* @type {State}
		*/
		function emailAtSignOrDot(code) {
			return asciiAlphanumeric$1(code) ? emailLabel(code) : nok(code);
		}
		/**
		* In label, where `.` and `>` are allowed.
		*
		* ```markdown
		* > | a<user.name@example.com>b
		*                   ^
		* ```
		*
		* @type {State}
		*/
		function emailLabel(code) {
			if (code === 46) {
				effects.consume(code);
				size = 0;
				return emailAtSignOrDot;
			}
			if (code === 62) {
				effects.exit("autolinkProtocol").type = "autolinkEmail";
				effects.enter("autolinkMarker");
				effects.consume(code);
				effects.exit("autolinkMarker");
				effects.exit("autolink");
				return ok;
			}
			return emailValue(code);
		}
		/**
		* In label, where `.` and `>` are *not* allowed.
		*
		* Though, this is also used in `emailLabel` to parse other values.
		*
		* ```markdown
		* > | a<user.name@ex-ample.com>b
		*                    ^
		* ```
		*
		* @type {State}
		*/
		function emailValue(code) {
			if ((code === 45 || asciiAlphanumeric$1(code)) && size++ < 63) {
				const next = code === 45 ? emailValue : emailLabel;
				effects.consume(code);
				return next;
			}
			return nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/blank-line.js
	/**
	* @import {
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var blankLine = {
		partial: true,
		tokenize: tokenizeBlankLine
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeBlankLine(effects, ok, nok) {
		return start;
		/**
		* Start of blank line.
		*
		* > 👉 **Note**: `␠` represents a space character.
		*
		* ```markdown
		* > | ␠␠␊
		*     ^
		* > | ␊
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			return markdownSpace$1(code) ? factorySpace$1(effects, after, "linePrefix")(code) : after(code);
		}
		/**
		* At eof/eol, after optional whitespace.
		*
		* > 👉 **Note**: `␠` represents a space character.
		*
		* ```markdown
		* > | ␠␠␊
		*       ^
		* > | ␊
		*     ^
		* ```
		*
		* @type {State}
		*/
		function after(code) {
			return code === null || markdownLineEnding$1(code) ? ok(code) : nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/block-quote.js
	/**
	* @import {
	*   Construct,
	*   Exiter,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var blockQuote = {
		continuation: { tokenize: tokenizeBlockQuoteContinuation },
		exit,
		name: "blockQuote",
		tokenize: tokenizeBlockQuoteStart
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeBlockQuoteStart(effects, ok, nok) {
		const self = this;
		return start;
		/**
		* Start of block quote.
		*
		* ```markdown
		* > | > a
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			if (code === 62) {
				const state = self.containerState;
				if (!state.open) {
					effects.enter("blockQuote", { _container: true });
					state.open = true;
				}
				effects.enter("blockQuotePrefix");
				effects.enter("blockQuoteMarker");
				effects.consume(code);
				effects.exit("blockQuoteMarker");
				return after;
			}
			return nok(code);
		}
		/**
		* After `>`, before optional whitespace.
		*
		* ```markdown
		* > | > a
		*      ^
		* ```
		*
		* @type {State}
		*/
		function after(code) {
			if (markdownSpace$1(code)) {
				effects.enter("blockQuotePrefixWhitespace");
				effects.consume(code);
				effects.exit("blockQuotePrefixWhitespace");
				effects.exit("blockQuotePrefix");
				return ok;
			}
			effects.exit("blockQuotePrefix");
			return ok(code);
		}
	}
	/**
	* Start of block quote continuation.
	*
	* ```markdown
	*   | > a
	* > | > b
	*     ^
	* ```
	*
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeBlockQuoteContinuation(effects, ok, nok) {
		const self = this;
		return contStart;
		/**
		* Start of block quote continuation.
		*
		* Also used to parse the first block quote opening.
		*
		* ```markdown
		*   | > a
		* > | > b
		*     ^
		* ```
		*
		* @type {State}
		*/
		function contStart(code) {
			if (markdownSpace$1(code)) return factorySpace$1(effects, contBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
			return contBefore(code);
		}
		/**
		* At `>`, after optional whitespace.
		*
		* Also used to parse the first block quote opening.
		*
		* ```markdown
		*   | > a
		* > | > b
		*     ^
		* ```
		*
		* @type {State}
		*/
		function contBefore(code) {
			return effects.attempt(blockQuote, ok, nok)(code);
		}
	}
	/** @type {Exiter} */
	function exit(effects) {
		effects.exit("blockQuote");
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/character-escape.js
	/**
	* @import {
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var characterEscape = {
		name: "characterEscape",
		tokenize: tokenizeCharacterEscape
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeCharacterEscape(effects, ok, nok) {
		return start;
		/**
		* Start of character escape.
		*
		* ```markdown
		* > | a\*b
		*      ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("characterEscape");
			effects.enter("escapeMarker");
			effects.consume(code);
			effects.exit("escapeMarker");
			return inside;
		}
		/**
		* After `\`, at punctuation.
		*
		* ```markdown
		* > | a\*b
		*       ^
		* ```
		*
		* @type {State}
		*/
		function inside(code) {
			if (asciiPunctuation(code)) {
				effects.enter("characterEscapeValue");
				effects.consume(code);
				effects.exit("characterEscapeValue");
				effects.exit("characterEscape");
				return ok;
			}
			return nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/character-reference.js
	/**
	* @import {
	*   Code,
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var characterReference = {
		name: "characterReference",
		tokenize: tokenizeCharacterReference
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeCharacterReference(effects, ok, nok) {
		const self = this;
		let size = 0;
		/** @type {number} */
		let max;
		/** @type {(code: Code) => boolean} */
		let test;
		return start;
		/**
		* Start of character reference.
		*
		* ```markdown
		* > | a&amp;b
		*      ^
		* > | a&#123;b
		*      ^
		* > | a&#x9;b
		*      ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("characterReference");
			effects.enter("characterReferenceMarker");
			effects.consume(code);
			effects.exit("characterReferenceMarker");
			return open;
		}
		/**
		* After `&`, at `#` for numeric references or alphanumeric for named
		* references.
		*
		* ```markdown
		* > | a&amp;b
		*       ^
		* > | a&#123;b
		*       ^
		* > | a&#x9;b
		*       ^
		* ```
		*
		* @type {State}
		*/
		function open(code) {
			if (code === 35) {
				effects.enter("characterReferenceMarkerNumeric");
				effects.consume(code);
				effects.exit("characterReferenceMarkerNumeric");
				return numeric;
			}
			effects.enter("characterReferenceValue");
			max = 31;
			test = asciiAlphanumeric$1;
			return value(code);
		}
		/**
		* After `#`, at `x` for hexadecimals or digit for decimals.
		*
		* ```markdown
		* > | a&#123;b
		*        ^
		* > | a&#x9;b
		*        ^
		* ```
		*
		* @type {State}
		*/
		function numeric(code) {
			if (code === 88 || code === 120) {
				effects.enter("characterReferenceMarkerHexadecimal");
				effects.consume(code);
				effects.exit("characterReferenceMarkerHexadecimal");
				effects.enter("characterReferenceValue");
				max = 6;
				test = asciiHexDigit;
				return value;
			}
			effects.enter("characterReferenceValue");
			max = 7;
			test = asciiDigit;
			return value(code);
		}
		/**
		* After markers (`&#x`, `&#`, or `&`), in value, before `;`.
		*
		* The character reference kind defines what and how many characters are
		* allowed.
		*
		* ```markdown
		* > | a&amp;b
		*       ^^^
		* > | a&#123;b
		*        ^^^
		* > | a&#x9;b
		*         ^
		* ```
		*
		* @type {State}
		*/
		function value(code) {
			if (code === 59 && size) {
				const token = effects.exit("characterReferenceValue");
				if (test === asciiAlphanumeric$1 && !decodeNamedCharacterReference(self.sliceSerialize(token))) return nok(code);
				effects.enter("characterReferenceMarker");
				effects.consume(code);
				effects.exit("characterReferenceMarker");
				effects.exit("characterReference");
				return ok;
			}
			if (test(code) && size++ < max) {
				effects.consume(code);
				return value;
			}
			return nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/code-fenced.js
	/**
	* @import {
	*   Code,
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var nonLazyContinuation = {
		partial: true,
		tokenize: tokenizeNonLazyContinuation
	};
	/** @type {Construct} */
	var codeFenced = {
		concrete: true,
		name: "codeFenced",
		tokenize: tokenizeCodeFenced
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeCodeFenced(effects, ok, nok) {
		const self = this;
		/** @type {Construct} */
		const closeStart = {
			partial: true,
			tokenize: tokenizeCloseStart
		};
		let initialPrefix = 0;
		let sizeOpen = 0;
		/** @type {NonNullable<Code>} */
		let marker;
		return start;
		/**
		* Start of code.
		*
		* ```markdown
		* > | ~~~js
		*     ^
		*   | alert(1)
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			return beforeSequenceOpen(code);
		}
		/**
		* In opening fence, after prefix, at sequence.
		*
		* ```markdown
		* > | ~~~js
		*     ^
		*   | alert(1)
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function beforeSequenceOpen(code) {
			const tail = self.events[self.events.length - 1];
			initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
			marker = code;
			effects.enter("codeFenced");
			effects.enter("codeFencedFence");
			effects.enter("codeFencedFenceSequence");
			return sequenceOpen(code);
		}
		/**
		* In opening fence sequence.
		*
		* ```markdown
		* > | ~~~js
		*      ^
		*   | alert(1)
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function sequenceOpen(code) {
			if (code === marker) {
				sizeOpen++;
				effects.consume(code);
				return sequenceOpen;
			}
			if (sizeOpen < 3) return nok(code);
			effects.exit("codeFencedFenceSequence");
			return markdownSpace$1(code) ? factorySpace$1(effects, infoBefore, "whitespace")(code) : infoBefore(code);
		}
		/**
		* In opening fence, after the sequence (and optional whitespace), before info.
		*
		* ```markdown
		* > | ~~~js
		*        ^
		*   | alert(1)
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function infoBefore(code) {
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("codeFencedFence");
				return self.interrupt ? ok(code) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
			}
			effects.enter("codeFencedFenceInfo");
			effects.enter("chunkString", { contentType: "string" });
			return info(code);
		}
		/**
		* In info.
		*
		* ```markdown
		* > | ~~~js
		*        ^
		*   | alert(1)
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function info(code) {
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("chunkString");
				effects.exit("codeFencedFenceInfo");
				return infoBefore(code);
			}
			if (markdownSpace$1(code)) {
				effects.exit("chunkString");
				effects.exit("codeFencedFenceInfo");
				return factorySpace$1(effects, metaBefore, "whitespace")(code);
			}
			if (code === 96 && code === marker) return nok(code);
			effects.consume(code);
			return info;
		}
		/**
		* In opening fence, after info and whitespace, before meta.
		*
		* ```markdown
		* > | ~~~js eval
		*           ^
		*   | alert(1)
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function metaBefore(code) {
			if (code === null || markdownLineEnding$1(code)) return infoBefore(code);
			effects.enter("codeFencedFenceMeta");
			effects.enter("chunkString", { contentType: "string" });
			return meta(code);
		}
		/**
		* In meta.
		*
		* ```markdown
		* > | ~~~js eval
		*           ^
		*   | alert(1)
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function meta(code) {
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("chunkString");
				effects.exit("codeFencedFenceMeta");
				return infoBefore(code);
			}
			if (code === 96 && code === marker) return nok(code);
			effects.consume(code);
			return meta;
		}
		/**
		* At eol/eof in code, before a non-lazy closing fence or content.
		*
		* ```markdown
		* > | ~~~js
		*          ^
		* > | alert(1)
		*             ^
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function atNonLazyBreak(code) {
			return effects.attempt(closeStart, after, contentBefore)(code);
		}
		/**
		* Before code content, not a closing fence, at eol.
		*
		* ```markdown
		*   | ~~~js
		* > | alert(1)
		*             ^
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function contentBefore(code) {
			effects.enter("lineEnding");
			effects.consume(code);
			effects.exit("lineEnding");
			return contentStart;
		}
		/**
		* Before code content, not a closing fence.
		*
		* ```markdown
		*   | ~~~js
		* > | alert(1)
		*     ^
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function contentStart(code) {
			return initialPrefix > 0 && markdownSpace$1(code) ? factorySpace$1(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code) : beforeContentChunk(code);
		}
		/**
		* Before code content, after optional prefix.
		*
		* ```markdown
		*   | ~~~js
		* > | alert(1)
		*     ^
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function beforeContentChunk(code) {
			if (code === null || markdownLineEnding$1(code)) return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
			effects.enter("codeFlowValue");
			return contentChunk(code);
		}
		/**
		* In code content.
		*
		* ```markdown
		*   | ~~~js
		* > | alert(1)
		*     ^^^^^^^^
		*   | ~~~
		* ```
		*
		* @type {State}
		*/
		function contentChunk(code) {
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("codeFlowValue");
				return beforeContentChunk(code);
			}
			effects.consume(code);
			return contentChunk;
		}
		/**
		* After code.
		*
		* ```markdown
		*   | ~~~js
		*   | alert(1)
		* > | ~~~
		*        ^
		* ```
		*
		* @type {State}
		*/
		function after(code) {
			effects.exit("codeFenced");
			return ok(code);
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCloseStart(effects, ok, nok) {
			let size = 0;
			return startBefore;
			/**
			*
			*
			* @type {State}
			*/
			function startBefore(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return start;
			}
			/**
			* Before closing fence, at optional whitespace.
			*
			* ```markdown
			*   | ~~~js
			*   | alert(1)
			* > | ~~~
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("codeFencedFence");
				return markdownSpace$1(code) ? factorySpace$1(effects, beforeSequenceClose, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : beforeSequenceClose(code);
			}
			/**
			* In closing fence, after optional whitespace, at sequence.
			*
			* ```markdown
			*   | ~~~js
			*   | alert(1)
			* > | ~~~
			*     ^
			* ```
			*
			* @type {State}
			*/
			function beforeSequenceClose(code) {
				if (code === marker) {
					effects.enter("codeFencedFenceSequence");
					return sequenceClose(code);
				}
				return nok(code);
			}
			/**
			* In closing fence sequence.
			*
			* ```markdown
			*   | ~~~js
			*   | alert(1)
			* > | ~~~
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequenceClose(code) {
				if (code === marker) {
					size++;
					effects.consume(code);
					return sequenceClose;
				}
				if (size >= sizeOpen) {
					effects.exit("codeFencedFenceSequence");
					return markdownSpace$1(code) ? factorySpace$1(effects, sequenceCloseAfter, "whitespace")(code) : sequenceCloseAfter(code);
				}
				return nok(code);
			}
			/**
			* After closing fence sequence, after optional whitespace.
			*
			* ```markdown
			*   | ~~~js
			*   | alert(1)
			* > | ~~~
			*        ^
			* ```
			*
			* @type {State}
			*/
			function sequenceCloseAfter(code) {
				if (code === null || markdownLineEnding$1(code)) {
					effects.exit("codeFencedFence");
					return ok(code);
				}
				return nok(code);
			}
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeNonLazyContinuation(effects, ok, nok) {
		const self = this;
		return start;
		/**
		*
		*
		* @type {State}
		*/
		function start(code) {
			if (code === null) return nok(code);
			effects.enter("lineEnding");
			effects.consume(code);
			effects.exit("lineEnding");
			return lineStart;
		}
		/**
		*
		*
		* @type {State}
		*/
		function lineStart(code) {
			return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/code-indented.js
	/**
	* @import {
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var codeIndented = {
		name: "codeIndented",
		tokenize: tokenizeCodeIndented
	};
	/** @type {Construct} */
	var furtherStart = {
		partial: true,
		tokenize: tokenizeFurtherStart
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeCodeIndented(effects, ok, nok) {
		const self = this;
		return start;
		/**
		* Start of code (indented).
		*
		* > **Parsing note**: it is not needed to check if this first line is a
		* > filled line (that it has a non-whitespace character), because blank lines
		* > are parsed already, so we never run into that.
		*
		* ```markdown
		* > |     aaa
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("codeIndented");
			return factorySpace$1(effects, afterPrefix, "linePrefix", 5)(code);
		}
		/**
		* At start, after 1 or 4 spaces.
		*
		* ```markdown
		* > |     aaa
		*         ^
		* ```
		*
		* @type {State}
		*/
		function afterPrefix(code) {
			const tail = self.events[self.events.length - 1];
			return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? atBreak(code) : nok(code);
		}
		/**
		* At a break.
		*
		* ```markdown
		* > |     aaa
		*         ^  ^
		* ```
		*
		* @type {State}
		*/
		function atBreak(code) {
			if (code === null) return after(code);
			if (markdownLineEnding$1(code)) return effects.attempt(furtherStart, atBreak, after)(code);
			effects.enter("codeFlowValue");
			return inside(code);
		}
		/**
		* In code content.
		*
		* ```markdown
		* > |     aaa
		*         ^^^^
		* ```
		*
		* @type {State}
		*/
		function inside(code) {
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("codeFlowValue");
				return atBreak(code);
			}
			effects.consume(code);
			return inside;
		}
		/** @type {State} */
		function after(code) {
			effects.exit("codeIndented");
			return ok(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeFurtherStart(effects, ok, nok) {
		const self = this;
		return furtherStart;
		/**
		* At eol, trying to parse another indent.
		*
		* ```markdown
		* > |     aaa
		*            ^
		*   |     bbb
		* ```
		*
		* @type {State}
		*/
		function furtherStart(code) {
			if (self.parser.lazy[self.now().line]) return nok(code);
			if (markdownLineEnding$1(code)) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return furtherStart;
			}
			return factorySpace$1(effects, afterPrefix, "linePrefix", 5)(code);
		}
		/**
		* At start, after 1 or 4 spaces.
		*
		* ```markdown
		* > |     aaa
		*         ^
		* ```
		*
		* @type {State}
		*/
		function afterPrefix(code) {
			const tail = self.events[self.events.length - 1];
			return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? ok(code) : markdownLineEnding$1(code) ? furtherStart(code) : nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/code-text.js
	/**
	* @import {
	*   Construct,
	*   Previous,
	*   Resolver,
	*   State,
	*   TokenizeContext,
	*   Tokenizer,
	*   Token
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var codeText = {
		name: "codeText",
		previous: previous$1,
		resolve: resolveCodeText,
		tokenize: tokenizeCodeText
	};
	/** @type {Resolver} */
	function resolveCodeText(events) {
		let tailExitIndex = events.length - 4;
		let headEnterIndex = 3;
		/** @type {number} */
		let index;
		/** @type {number | undefined} */
		let enter;
		if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
			index = headEnterIndex;
			while (++index < tailExitIndex) if (events[index][1].type === "codeTextData") {
				events[headEnterIndex][1].type = "codeTextPadding";
				events[tailExitIndex][1].type = "codeTextPadding";
				headEnterIndex += 2;
				tailExitIndex -= 2;
				break;
			}
		}
		index = headEnterIndex - 1;
		tailExitIndex++;
		while (++index <= tailExitIndex) if (enter === void 0) {
			if (index !== tailExitIndex && events[index][1].type !== "lineEnding") enter = index;
		} else if (index === tailExitIndex || events[index][1].type === "lineEnding") {
			events[enter][1].type = "codeTextData";
			if (index !== enter + 2) {
				events[enter][1].end = events[index - 1][1].end;
				events.splice(enter + 2, index - enter - 2);
				tailExitIndex -= index - enter - 2;
				index = enter + 2;
			}
			enter = void 0;
		}
		return events;
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Previous}
	*/
	function previous$1(code) {
		return code !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeCodeText(effects, ok, nok) {
		let sizeOpen = 0;
		/** @type {number} */
		let size;
		/** @type {Token} */
		let token;
		return start;
		/**
		* Start of code (text).
		*
		* ```markdown
		* > | `a`
		*     ^
		* > | \`a`
		*      ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("codeText");
			effects.enter("codeTextSequence");
			return sequenceOpen(code);
		}
		/**
		* In opening sequence.
		*
		* ```markdown
		* > | `a`
		*     ^
		* ```
		*
		* @type {State}
		*/
		function sequenceOpen(code) {
			if (code === 96) {
				effects.consume(code);
				sizeOpen++;
				return sequenceOpen;
			}
			effects.exit("codeTextSequence");
			return between(code);
		}
		/**
		* Between something and something else.
		*
		* ```markdown
		* > | `a`
		*      ^^
		* ```
		*
		* @type {State}
		*/
		function between(code) {
			if (code === null) return nok(code);
			if (code === 32) {
				effects.enter("space");
				effects.consume(code);
				effects.exit("space");
				return between;
			}
			if (code === 96) {
				token = effects.enter("codeTextSequence");
				size = 0;
				return sequenceClose(code);
			}
			if (markdownLineEnding$1(code)) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return between;
			}
			effects.enter("codeTextData");
			return data(code);
		}
		/**
		* In data.
		*
		* ```markdown
		* > | `a`
		*      ^
		* ```
		*
		* @type {State}
		*/
		function data(code) {
			if (code === null || code === 32 || code === 96 || markdownLineEnding$1(code)) {
				effects.exit("codeTextData");
				return between(code);
			}
			effects.consume(code);
			return data;
		}
		/**
		* In closing sequence.
		*
		* ```markdown
		* > | `a`
		*       ^
		* ```
		*
		* @type {State}
		*/
		function sequenceClose(code) {
			if (code === 96) {
				effects.consume(code);
				size++;
				return sequenceClose;
			}
			if (size === sizeOpen) {
				effects.exit("codeTextSequence");
				effects.exit("codeText");
				return ok(code);
			}
			token.type = "codeTextData";
			return data(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-util-subtokenize/lib/splice-buffer.js
	/**
	* Some of the internal operations of micromark do lots of editing
	* operations on very large arrays. This runs into problems with two
	* properties of most circa-2020 JavaScript interpreters:
	*
	*  - Array-length modifications at the high end of an array (push/pop) are
	*    expected to be common and are implemented in (amortized) time
	*    proportional to the number of elements added or removed, whereas
	*    other operations (shift/unshift and splice) are much less efficient.
	*  - Function arguments are passed on the stack, so adding tens of thousands
	*    of elements to an array with `arr.push(...newElements)` will frequently
	*    cause stack overflows. (see <https://stackoverflow.com/questions/22123769/rangeerror-maximum-call-stack-size-exceeded-why>)
	*
	* SpliceBuffers are an implementation of gap buffers, which are a
	* generalization of the "queue made of two stacks" idea. The splice buffer
	* maintains a cursor, and moving the cursor has cost proportional to the
	* distance the cursor moves, but inserting, deleting, or splicing in
	* new information at the cursor is as efficient as the push/pop operation.
	* This allows for an efficient sequence of splices (or pushes, pops, shifts,
	* or unshifts) as long such edits happen at the same part of the array or
	* generally sweep through the array from the beginning to the end.
	*
	* The interface for splice buffers also supports large numbers of inputs by
	* passing a single array argument rather passing multiple arguments on the
	* function call stack.
	*
	* @template T
	*   Item type.
	*/
	var SpliceBuffer = class {
		/**
		* @param {ReadonlyArray<T> | null | undefined} [initial]
		*   Initial items (optional).
		* @returns
		*   Splice buffer.
		*/
		constructor(initial) {
			/** @type {Array<T>} */
			this.left = initial ? [...initial] : [];
			/** @type {Array<T>} */
			this.right = [];
		}
		/**
		* Array access;
		* does not move the cursor.
		*
		* @param {number} index
		*   Index.
		* @return {T}
		*   Item.
		*/
		get(index) {
			if (index < 0 || index >= this.left.length + this.right.length) throw new RangeError("Cannot access index `" + index + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
			if (index < this.left.length) return this.left[index];
			return this.right[this.right.length - index + this.left.length - 1];
		}
		/**
		* The length of the splice buffer, one greater than the largest index in the
		* array.
		*/
		get length() {
			return this.left.length + this.right.length;
		}
		/**
		* Remove and return `list[0]`;
		* moves the cursor to `0`.
		*
		* @returns {T | undefined}
		*   Item, optional.
		*/
		shift() {
			this.setCursor(0);
			return this.right.pop();
		}
		/**
		* Slice the buffer to get an array;
		* does not move the cursor.
		*
		* @param {number} start
		*   Start.
		* @param {number | null | undefined} [end]
		*   End (optional).
		* @returns {Array<T>}
		*   Array of items.
		*/
		slice(start, end) {
			/** @type {number} */
			const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
			if (stop < this.left.length) return this.left.slice(start, stop);
			if (start > this.left.length) return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
			return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
		}
		/**
		* Mimics the behavior of Array.prototype.splice() except for the change of
		* interface necessary to avoid segfaults when patching in very large arrays.
		*
		* This operation moves cursor is moved to `start` and results in the cursor
		* placed after any inserted items.
		*
		* @param {number} start
		*   Start;
		*   zero-based index at which to start changing the array;
		*   negative numbers count backwards from the end of the array and values
		*   that are out-of bounds are clamped to the appropriate end of the array.
		* @param {number | null | undefined} [deleteCount=0]
		*   Delete count (default: `0`);
		*   maximum number of elements to delete, starting from start.
		* @param {Array<T> | null | undefined} [items=[]]
		*   Items to include in place of the deleted items (default: `[]`).
		* @return {Array<T>}
		*   Any removed items.
		*/
		splice(start, deleteCount, items) {
			/** @type {number} */
			const count = deleteCount || 0;
			this.setCursor(Math.trunc(start));
			const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
			if (items) chunkedPush(this.left, items);
			return removed.reverse();
		}
		/**
		* Remove and return the highest-numbered item in the array, so
		* `list[list.length - 1]`;
		* Moves the cursor to `length`.
		*
		* @returns {T | undefined}
		*   Item, optional.
		*/
		pop() {
			this.setCursor(Number.POSITIVE_INFINITY);
			return this.left.pop();
		}
		/**
		* Inserts a single item to the high-numbered side of the array;
		* moves the cursor to `length`.
		*
		* @param {T} item
		*   Item.
		* @returns {undefined}
		*   Nothing.
		*/
		push(item) {
			this.setCursor(Number.POSITIVE_INFINITY);
			this.left.push(item);
		}
		/**
		* Inserts many items to the high-numbered side of the array.
		* Moves the cursor to `length`.
		*
		* @param {Array<T>} items
		*   Items.
		* @returns {undefined}
		*   Nothing.
		*/
		pushMany(items) {
			this.setCursor(Number.POSITIVE_INFINITY);
			chunkedPush(this.left, items);
		}
		/**
		* Inserts a single item to the low-numbered side of the array;
		* Moves the cursor to `0`.
		*
		* @param {T} item
		*   Item.
		* @returns {undefined}
		*   Nothing.
		*/
		unshift(item) {
			this.setCursor(0);
			this.right.push(item);
		}
		/**
		* Inserts many items to the low-numbered side of the array;
		* moves the cursor to `0`.
		*
		* @param {Array<T>} items
		*   Items.
		* @returns {undefined}
		*   Nothing.
		*/
		unshiftMany(items) {
			this.setCursor(0);
			chunkedPush(this.right, items.reverse());
		}
		/**
		* Move the cursor to a specific position in the array. Requires
		* time proportional to the distance moved.
		*
		* If `n < 0`, the cursor will end up at the beginning.
		* If `n > length`, the cursor will end up at the end.
		*
		* @param {number} n
		*   Position.
		* @return {undefined}
		*   Nothing.
		*/
		setCursor(n) {
			if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
			if (n < this.left.length) {
				const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
				chunkedPush(this.right, removed.reverse());
			} else {
				const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
				chunkedPush(this.left, removed.reverse());
			}
		}
	};
	/**
	* Avoid stack overflow by pushing items onto the stack in segments
	*
	* @template T
	*   Item type.
	* @param {Array<T>} list
	*   List to inject into.
	* @param {ReadonlyArray<T>} right
	*   Items to inject.
	* @return {undefined}
	*   Nothing.
	*/
	function chunkedPush(list, right) {
		/** @type {number} */
		let chunkStart = 0;
		if (right.length < 1e4) list.push(...right);
		else while (chunkStart < right.length) {
			list.push(...right.slice(chunkStart, chunkStart + 1e4));
			chunkStart += 1e4;
		}
	}
	//#endregion
	//#region node_modules/micromark-util-subtokenize/index.js
	/**
	* @import {Chunk, Event, Token} from 'micromark-util-types'
	*/
	/**
	* Tokenize subcontent.
	*
	* @param {Array<Event>} eventsArray
	*   List of events.
	* @returns {boolean}
	*   Whether subtokens were found.
	*/
	function subtokenize(eventsArray) {
		/** @type {Record<string, number>} */
		const jumps = {};
		let index = -1;
		/** @type {Event} */
		let event;
		/** @type {number | undefined} */
		let lineIndex;
		/** @type {number} */
		let otherIndex;
		/** @type {Event} */
		let otherEvent;
		/** @type {Array<Event>} */
		let parameters;
		/** @type {Array<Event>} */
		let subevents;
		/** @type {boolean | undefined} */
		let more;
		const events = new SpliceBuffer(eventsArray);
		while (++index < events.length) {
			while (index in jumps) index = jumps[index];
			event = events.get(index);
			if (index && event[1].type === "chunkFlow" && events.get(index - 1)[1].type === "listItemPrefix") {
				subevents = event[1]._tokenizer.events;
				otherIndex = 0;
				if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") otherIndex += 2;
				if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") while (++otherIndex < subevents.length) {
					if (subevents[otherIndex][1].type === "content") break;
					if (subevents[otherIndex][1].type === "chunkText") {
						subevents[otherIndex][1]._isInFirstContentOfListItem = true;
						otherIndex++;
					}
				}
			}
			if (event[0] === "enter") {
				if (event[1].contentType) {
					Object.assign(jumps, subcontent(events, index));
					index = jumps[index];
					more = true;
				}
			} else if (event[1]._container) {
				otherIndex = index;
				lineIndex = void 0;
				while (otherIndex--) {
					otherEvent = events.get(otherIndex);
					if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
						if (otherEvent[0] === "enter") {
							if (lineIndex) events.get(lineIndex)[1].type = "lineEndingBlank";
							otherEvent[1].type = "lineEnding";
							lineIndex = otherIndex;
						}
					} else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") {} else break;
				}
				if (lineIndex) {
					event[1].end = { ...events.get(lineIndex)[1].start };
					parameters = events.slice(lineIndex, index);
					parameters.unshift(event);
					events.splice(lineIndex, index - lineIndex + 1, parameters);
				}
			}
		}
		splice$1(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
		return !more;
	}
	/**
	* Tokenize embedded tokens.
	*
	* @param {SpliceBuffer<Event>} events
	*   Events.
	* @param {number} eventIndex
	*   Index.
	* @returns {Record<string, number>}
	*   Gaps.
	*/
	function subcontent(events, eventIndex) {
		const token = events.get(eventIndex)[1];
		const context = events.get(eventIndex)[2];
		let startPosition = eventIndex - 1;
		/** @type {Array<number>} */
		const startPositions = [];
		let tokenizer = token._tokenizer;
		if (!tokenizer) {
			tokenizer = context.parser[token.contentType](token.start);
			if (token._contentTypeTextTrailing) tokenizer._contentTypeTextTrailing = true;
		}
		const childEvents = tokenizer.events;
		/** @type {Array<[number, number]>} */
		const jumps = [];
		/** @type {Record<string, number>} */
		const gaps = {};
		/** @type {Array<Chunk>} */
		let stream;
		/** @type {Token | undefined} */
		let previous;
		let index = -1;
		/** @type {Token | undefined} */
		let current = token;
		let adjust = 0;
		let start = 0;
		const breaks = [start];
		while (current) {
			while (events.get(++startPosition)[1] !== current);
			startPositions.push(startPosition);
			if (!current._tokenizer) {
				stream = context.sliceStream(current);
				if (!current.next) stream.push(null);
				if (previous) tokenizer.defineSkip(current.start);
				if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = true;
				tokenizer.write(stream);
				if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = void 0;
			}
			previous = current;
			current = current.next;
		}
		current = token;
		while (++index < childEvents.length) if (childEvents[index][0] === "exit" && childEvents[index - 1][0] === "enter" && childEvents[index][1].type === childEvents[index - 1][1].type && childEvents[index][1].start.line !== childEvents[index][1].end.line) {
			start = index + 1;
			breaks.push(start);
			current._tokenizer = void 0;
			current.previous = void 0;
			current = current.next;
		}
		tokenizer.events = [];
		if (current) {
			current._tokenizer = void 0;
			current.previous = void 0;
		} else breaks.pop();
		index = breaks.length;
		while (index--) {
			const slice = childEvents.slice(breaks[index], breaks[index + 1]);
			const start = startPositions.pop();
			jumps.push([start, start + slice.length - 1]);
			events.splice(start, 2, slice);
		}
		jumps.reverse();
		index = -1;
		while (++index < jumps.length) {
			gaps[adjust + jumps[index][0]] = adjust + jumps[index][1];
			adjust += jumps[index][1] - jumps[index][0] - 1;
		}
		return gaps;
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/content.js
	/**
	* @import {
	*   Construct,
	*   Resolver,
	*   State,
	*   TokenizeContext,
	*   Tokenizer,
	*   Token
	* } from 'micromark-util-types'
	*/
	/**
	* No name because it must not be turned off.
	* @type {Construct}
	*/
	var content = {
		resolve: resolveContent,
		tokenize: tokenizeContent
	};
	/** @type {Construct} */
	var continuationConstruct = {
		partial: true,
		tokenize: tokenizeContinuation
	};
	/**
	* Content is transparent: it’s parsed right now. That way, definitions are also
	* parsed right now: before text in paragraphs (specifically, media) are parsed.
	*
	* @type {Resolver}
	*/
	function resolveContent(events) {
		subtokenize(events);
		return events;
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeContent(effects, ok) {
		/** @type {Token | undefined} */
		let previous;
		return chunkStart;
		/**
		* Before a content chunk.
		*
		* ```markdown
		* > | abc
		*     ^
		* ```
		*
		* @type {State}
		*/
		function chunkStart(code) {
			effects.enter("content");
			previous = effects.enter("chunkContent", { contentType: "content" });
			return chunkInside(code);
		}
		/**
		* In a content chunk.
		*
		* ```markdown
		* > | abc
		*     ^^^
		* ```
		*
		* @type {State}
		*/
		function chunkInside(code) {
			if (code === null) return contentEnd(code);
			if (markdownLineEnding$1(code)) return effects.check(continuationConstruct, contentContinue, contentEnd)(code);
			effects.consume(code);
			return chunkInside;
		}
		/**
		*
		*
		* @type {State}
		*/
		function contentEnd(code) {
			effects.exit("chunkContent");
			effects.exit("content");
			return ok(code);
		}
		/**
		*
		*
		* @type {State}
		*/
		function contentContinue(code) {
			effects.consume(code);
			effects.exit("chunkContent");
			previous.next = effects.enter("chunkContent", {
				contentType: "content",
				previous
			});
			previous = previous.next;
			return chunkInside;
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeContinuation(effects, ok, nok) {
		const self = this;
		return startLookahead;
		/**
		*
		*
		* @type {State}
		*/
		function startLookahead(code) {
			effects.exit("chunkContent");
			effects.enter("lineEnding");
			effects.consume(code);
			effects.exit("lineEnding");
			return factorySpace$1(effects, prefixed, "linePrefix");
		}
		/**
		*
		*
		* @type {State}
		*/
		function prefixed(code) {
			if (code === null || markdownLineEnding$1(code)) return nok(code);
			const tail = self.events[self.events.length - 1];
			if (!self.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) return ok(code);
			return effects.interrupt(self.parser.constructs.flow, nok, ok)(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-factory-destination/index.js
	/**
	* @import {Effects, State, TokenType} from 'micromark-util-types'
	*/
	/**
	* Parse destinations.
	*
	* ###### Examples
	*
	* ```markdown
	* <a>
	* <a\>b>
	* <a b>
	* <a)>
	* a
	* a\)b
	* a(b)c
	* a(b)
	* ```
	*
	* @param {Effects} effects
	*   Context.
	* @param {State} ok
	*   State switched to when successful.
	* @param {State} nok
	*   State switched to when unsuccessful.
	* @param {TokenType} type
	*   Type for whole (`<a>` or `b`).
	* @param {TokenType} literalType
	*   Type when enclosed (`<a>`).
	* @param {TokenType} literalMarkerType
	*   Type for enclosing (`<` and `>`).
	* @param {TokenType} rawType
	*   Type when not enclosed (`b`).
	* @param {TokenType} stringType
	*   Type for the value (`a` or `b`).
	* @param {number | undefined} [max=Infinity]
	*   Depth of nested parens (inclusive).
	* @returns {State}
	*   Start state.
	*/
	function factoryDestination(effects, ok, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
		const limit = max || Number.POSITIVE_INFINITY;
		let balance = 0;
		return start;
		/**
		* Start of destination.
		*
		* ```markdown
		* > | <aa>
		*     ^
		* > | aa
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			if (code === 60) {
				effects.enter(type);
				effects.enter(literalType);
				effects.enter(literalMarkerType);
				effects.consume(code);
				effects.exit(literalMarkerType);
				return enclosedBefore;
			}
			if (code === null || code === 32 || code === 41 || asciiControl$1(code)) return nok(code);
			effects.enter(type);
			effects.enter(rawType);
			effects.enter(stringType);
			effects.enter("chunkString", { contentType: "string" });
			return raw(code);
		}
		/**
		* After `<`, at an enclosed destination.
		*
		* ```markdown
		* > | <aa>
		*      ^
		* ```
		*
		* @type {State}
		*/
		function enclosedBefore(code) {
			if (code === 62) {
				effects.enter(literalMarkerType);
				effects.consume(code);
				effects.exit(literalMarkerType);
				effects.exit(literalType);
				effects.exit(type);
				return ok;
			}
			effects.enter(stringType);
			effects.enter("chunkString", { contentType: "string" });
			return enclosed(code);
		}
		/**
		* In enclosed destination.
		*
		* ```markdown
		* > | <aa>
		*      ^
		* ```
		*
		* @type {State}
		*/
		function enclosed(code) {
			if (code === 62) {
				effects.exit("chunkString");
				effects.exit(stringType);
				return enclosedBefore(code);
			}
			if (code === null || code === 60 || markdownLineEnding$1(code)) return nok(code);
			effects.consume(code);
			return code === 92 ? enclosedEscape : enclosed;
		}
		/**
		* After `\`, at a special character.
		*
		* ```markdown
		* > | <a\*a>
		*        ^
		* ```
		*
		* @type {State}
		*/
		function enclosedEscape(code) {
			if (code === 60 || code === 62 || code === 92) {
				effects.consume(code);
				return enclosed;
			}
			return enclosed(code);
		}
		/**
		* In raw destination.
		*
		* ```markdown
		* > | aa
		*     ^
		* ```
		*
		* @type {State}
		*/
		function raw(code) {
			if (!balance && (code === null || code === 41 || markdownLineEndingOrSpace$1(code))) {
				effects.exit("chunkString");
				effects.exit(stringType);
				effects.exit(rawType);
				effects.exit(type);
				return ok(code);
			}
			if (balance < limit && code === 40) {
				effects.consume(code);
				balance++;
				return raw;
			}
			if (code === 41) {
				effects.consume(code);
				balance--;
				return raw;
			}
			if (code === null || code === 32 || code === 40 || asciiControl$1(code)) return nok(code);
			effects.consume(code);
			return code === 92 ? rawEscape : raw;
		}
		/**
		* After `\`, at special character.
		*
		* ```markdown
		* > | a\*a
		*       ^
		* ```
		*
		* @type {State}
		*/
		function rawEscape(code) {
			if (code === 40 || code === 41 || code === 92) {
				effects.consume(code);
				return raw;
			}
			return raw(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-factory-label/index.js
	/**
	* @import {
	*   Effects,
	*   State,
	*   TokenizeContext,
	*   TokenType
	* } from 'micromark-util-types'
	*/
	/**
	* Parse labels.
	*
	* > 👉 **Note**: labels in markdown are capped at 999 characters in the string.
	*
	* ###### Examples
	*
	* ```markdown
	* [a]
	* [a
	* b]
	* [a\]b]
	* ```
	*
	* @this {TokenizeContext}
	*   Tokenize context.
	* @param {Effects} effects
	*   Context.
	* @param {State} ok
	*   State switched to when successful.
	* @param {State} nok
	*   State switched to when unsuccessful.
	* @param {TokenType} type
	*   Type of the whole label (`[a]`).
	* @param {TokenType} markerType
	*   Type for the markers (`[` and `]`).
	* @param {TokenType} stringType
	*   Type for the identifier (`a`).
	* @returns {State}
	*   Start state.
	*/
	function factoryLabel(effects, ok, nok, type, markerType, stringType) {
		const self = this;
		let size = 0;
		/** @type {boolean} */
		let seen;
		return start;
		/**
		* Start of label.
		*
		* ```markdown
		* > | [a]
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter(type);
			effects.enter(markerType);
			effects.consume(code);
			effects.exit(markerType);
			effects.enter(stringType);
			return atBreak;
		}
		/**
		* In label, at something, before something else.
		*
		* ```markdown
		* > | [a]
		*      ^
		* ```
		*
		* @type {State}
		*/
		function atBreak(code) {
			if (size > 999 || code === null || code === 91 || code === 93 && !seen || code === 94 && !size && "_hiddenFootnoteSupport" in self.parser.constructs) return nok(code);
			if (code === 93) {
				effects.exit(stringType);
				effects.enter(markerType);
				effects.consume(code);
				effects.exit(markerType);
				effects.exit(type);
				return ok;
			}
			if (markdownLineEnding$1(code)) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return atBreak;
			}
			effects.enter("chunkString", { contentType: "string" });
			return labelInside(code);
		}
		/**
		* In label, in text.
		*
		* ```markdown
		* > | [a]
		*      ^
		* ```
		*
		* @type {State}
		*/
		function labelInside(code) {
			if (code === null || code === 91 || code === 93 || markdownLineEnding$1(code) || size++ > 999) {
				effects.exit("chunkString");
				return atBreak(code);
			}
			effects.consume(code);
			if (!seen) seen = !markdownSpace$1(code);
			return code === 92 ? labelEscape : labelInside;
		}
		/**
		* After `\`, at a special character.
		*
		* ```markdown
		* > | [a\*a]
		*        ^
		* ```
		*
		* @type {State}
		*/
		function labelEscape(code) {
			if (code === 91 || code === 92 || code === 93) {
				effects.consume(code);
				size++;
				return labelInside;
			}
			return labelInside(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-factory-title/index.js
	/**
	* @import {
	*   Code,
	*   Effects,
	*   State,
	*   TokenType
	* } from 'micromark-util-types'
	*/
	/**
	* Parse titles.
	*
	* ###### Examples
	*
	* ```markdown
	* "a"
	* 'b'
	* (c)
	* "a
	* b"
	* 'a
	*     b'
	* (a\)b)
	* ```
	*
	* @param {Effects} effects
	*   Context.
	* @param {State} ok
	*   State switched to when successful.
	* @param {State} nok
	*   State switched to when unsuccessful.
	* @param {TokenType} type
	*   Type of the whole title (`"a"`, `'b'`, `(c)`).
	* @param {TokenType} markerType
	*   Type for the markers (`"`, `'`, `(`, and `)`).
	* @param {TokenType} stringType
	*   Type for the value (`a`).
	* @returns {State}
	*   Start state.
	*/
	function factoryTitle(effects, ok, nok, type, markerType, stringType) {
		/** @type {NonNullable<Code>} */
		let marker;
		return start;
		/**
		* Start of title.
		*
		* ```markdown
		* > | "a"
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			if (code === 34 || code === 39 || code === 40) {
				effects.enter(type);
				effects.enter(markerType);
				effects.consume(code);
				effects.exit(markerType);
				marker = code === 40 ? 41 : code;
				return begin;
			}
			return nok(code);
		}
		/**
		* After opening marker.
		*
		* This is also used at the closing marker.
		*
		* ```markdown
		* > | "a"
		*      ^
		* ```
		*
		* @type {State}
		*/
		function begin(code) {
			if (code === marker) {
				effects.enter(markerType);
				effects.consume(code);
				effects.exit(markerType);
				effects.exit(type);
				return ok;
			}
			effects.enter(stringType);
			return atBreak(code);
		}
		/**
		* At something, before something else.
		*
		* ```markdown
		* > | "a"
		*      ^
		* ```
		*
		* @type {State}
		*/
		function atBreak(code) {
			if (code === marker) {
				effects.exit(stringType);
				return begin(marker);
			}
			if (code === null) return nok(code);
			if (markdownLineEnding$1(code)) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace$1(effects, atBreak, "linePrefix");
			}
			effects.enter("chunkString", { contentType: "string" });
			return inside(code);
		}
		/**
		*
		*
		* @type {State}
		*/
		function inside(code) {
			if (code === marker || code === null || markdownLineEnding$1(code)) {
				effects.exit("chunkString");
				return atBreak(code);
			}
			effects.consume(code);
			return code === 92 ? escape : inside;
		}
		/**
		* After `\`, at a special character.
		*
		* ```markdown
		* > | "a\*b"
		*      ^
		* ```
		*
		* @type {State}
		*/
		function escape(code) {
			if (code === marker || code === 92) {
				effects.consume(code);
				return inside;
			}
			return inside(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-factory-whitespace/index.js
	/**
	* @import {Effects, State} from 'micromark-util-types'
	*/
	/**
	* Parse spaces and tabs.
	*
	* There is no `nok` parameter:
	*
	* *   line endings or spaces in markdown are often optional, in which case this
	*     factory can be used and `ok` will be switched to whether spaces were found
	*     or not
	* *   one line ending or space can be detected with
	*     `markdownLineEndingOrSpace(code)` right before using `factoryWhitespace`
	*
	* @param {Effects} effects
	*   Context.
	* @param {State} ok
	*   State switched to when successful.
	* @returns {State}
	*   Start state.
	*/
	function factoryWhitespace(effects, ok) {
		/** @type {boolean} */
		let seen;
		return start;
		/** @type {State} */
		function start(code) {
			if (markdownLineEnding$1(code)) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				seen = true;
				return start;
			}
			if (markdownSpace$1(code)) return factorySpace$1(effects, start, seen ? "linePrefix" : "lineSuffix")(code);
			return ok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/definition.js
	/**
	* @import {
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var definition$2 = {
		name: "definition",
		tokenize: tokenizeDefinition
	};
	/** @type {Construct} */
	var titleBefore = {
		partial: true,
		tokenize: tokenizeTitleBefore
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeDefinition(effects, ok, nok) {
		const self = this;
		/** @type {string} */
		let identifier;
		return start;
		/**
		* At start of a definition.
		*
		* ```markdown
		* > | [a]: b "c"
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("definition");
			return before(code);
		}
		/**
		* After optional whitespace, at `[`.
		*
		* ```markdown
		* > | [a]: b "c"
		*     ^
		* ```
		*
		* @type {State}
		*/
		function before(code) {
			return factoryLabel.call(self, effects, labelAfter, nok, "definitionLabel", "definitionLabelMarker", "definitionLabelString")(code);
		}
		/**
		* After label.
		*
		* ```markdown
		* > | [a]: b "c"
		*        ^
		* ```
		*
		* @type {State}
		*/
		function labelAfter(code) {
			identifier = normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1));
			if (code === 58) {
				effects.enter("definitionMarker");
				effects.consume(code);
				effects.exit("definitionMarker");
				return markerAfter;
			}
			return nok(code);
		}
		/**
		* After marker.
		*
		* ```markdown
		* > | [a]: b "c"
		*         ^
		* ```
		*
		* @type {State}
		*/
		function markerAfter(code) {
			return markdownLineEndingOrSpace$1(code) ? factoryWhitespace(effects, destinationBefore)(code) : destinationBefore(code);
		}
		/**
		* Before destination.
		*
		* ```markdown
		* > | [a]: b "c"
		*          ^
		* ```
		*
		* @type {State}
		*/
		function destinationBefore(code) {
			return factoryDestination(effects, destinationAfter, nok, "definitionDestination", "definitionDestinationLiteral", "definitionDestinationLiteralMarker", "definitionDestinationRaw", "definitionDestinationString")(code);
		}
		/**
		* After destination.
		*
		* ```markdown
		* > | [a]: b "c"
		*           ^
		* ```
		*
		* @type {State}
		*/
		function destinationAfter(code) {
			return effects.attempt(titleBefore, after, after)(code);
		}
		/**
		* After definition.
		*
		* ```markdown
		* > | [a]: b
		*           ^
		* > | [a]: b "c"
		*               ^
		* ```
		*
		* @type {State}
		*/
		function after(code) {
			return markdownSpace$1(code) ? factorySpace$1(effects, afterWhitespace, "whitespace")(code) : afterWhitespace(code);
		}
		/**
		* After definition, after optional whitespace.
		*
		* ```markdown
		* > | [a]: b
		*           ^
		* > | [a]: b "c"
		*               ^
		* ```
		*
		* @type {State}
		*/
		function afterWhitespace(code) {
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("definition");
				self.parser.defined.push(identifier);
				return ok(code);
			}
			return nok(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeTitleBefore(effects, ok, nok) {
		return titleBefore;
		/**
		* After destination, at whitespace.
		*
		* ```markdown
		* > | [a]: b
		*           ^
		* > | [a]: b "c"
		*           ^
		* ```
		*
		* @type {State}
		*/
		function titleBefore(code) {
			return markdownLineEndingOrSpace$1(code) ? factoryWhitespace(effects, beforeMarker)(code) : nok(code);
		}
		/**
		* At title.
		*
		* ```markdown
		*   | [a]: b
		* > | "c"
		*     ^
		* ```
		*
		* @type {State}
		*/
		function beforeMarker(code) {
			return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code);
		}
		/**
		* After title.
		*
		* ```markdown
		* > | [a]: b "c"
		*               ^
		* ```
		*
		* @type {State}
		*/
		function titleAfter(code) {
			return markdownSpace$1(code) ? factorySpace$1(effects, titleAfterOptionalWhitespace, "whitespace")(code) : titleAfterOptionalWhitespace(code);
		}
		/**
		* After title, after optional whitespace.
		*
		* ```markdown
		* > | [a]: b "c"
		*               ^
		* ```
		*
		* @type {State}
		*/
		function titleAfterOptionalWhitespace(code) {
			return code === null || markdownLineEnding$1(code) ? ok(code) : nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/hard-break-escape.js
	/**
	* @import {
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var hardBreakEscape = {
		name: "hardBreakEscape",
		tokenize: tokenizeHardBreakEscape
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeHardBreakEscape(effects, ok, nok) {
		return start;
		/**
		* Start of a hard break (escape).
		*
		* ```markdown
		* > | a\
		*      ^
		*   | b
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("hardBreakEscape");
			effects.consume(code);
			return after;
		}
		/**
		* After `\`, at eol.
		*
		* ```markdown
		* > | a\
		*       ^
		*   | b
		* ```
		*
		*  @type {State}
		*/
		function after(code) {
			if (markdownLineEnding$1(code)) {
				effects.exit("hardBreakEscape");
				return ok(code);
			}
			return nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/heading-atx.js
	/**
	* @import {
	*   Construct,
	*   Resolver,
	*   State,
	*   TokenizeContext,
	*   Tokenizer,
	*   Token
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var headingAtx = {
		name: "headingAtx",
		resolve: resolveHeadingAtx,
		tokenize: tokenizeHeadingAtx
	};
	/** @type {Resolver} */
	function resolveHeadingAtx(events, context) {
		let contentEnd = events.length - 2;
		let contentStart = 3;
		/** @type {Token} */
		let content;
		/** @type {Token} */
		let text;
		if (events[contentStart][1].type === "whitespace") contentStart += 2;
		if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") contentEnd -= 2;
		if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
		if (contentEnd > contentStart) {
			content = {
				type: "atxHeadingText",
				start: events[contentStart][1].start,
				end: events[contentEnd][1].end
			};
			text = {
				type: "chunkText",
				start: events[contentStart][1].start,
				end: events[contentEnd][1].end,
				contentType: "text"
			};
			splice$1(events, contentStart, contentEnd - contentStart + 1, [
				[
					"enter",
					content,
					context
				],
				[
					"enter",
					text,
					context
				],
				[
					"exit",
					text,
					context
				],
				[
					"exit",
					content,
					context
				]
			]);
		}
		return events;
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeHeadingAtx(effects, ok, nok) {
		let size = 0;
		return start;
		/**
		* Start of a heading (atx).
		*
		* ```markdown
		* > | ## aa
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("atxHeading");
			return before(code);
		}
		/**
		* After optional whitespace, at `#`.
		*
		* ```markdown
		* > | ## aa
		*     ^
		* ```
		*
		* @type {State}
		*/
		function before(code) {
			effects.enter("atxHeadingSequence");
			return sequenceOpen(code);
		}
		/**
		* In opening sequence.
		*
		* ```markdown
		* > | ## aa
		*     ^
		* ```
		*
		* @type {State}
		*/
		function sequenceOpen(code) {
			if (code === 35 && size++ < 6) {
				effects.consume(code);
				return sequenceOpen;
			}
			if (code === null || markdownLineEndingOrSpace$1(code)) {
				effects.exit("atxHeadingSequence");
				return atBreak(code);
			}
			return nok(code);
		}
		/**
		* After something, before something else.
		*
		* ```markdown
		* > | ## aa
		*       ^
		* ```
		*
		* @type {State}
		*/
		function atBreak(code) {
			if (code === 35) {
				effects.enter("atxHeadingSequence");
				return sequenceFurther(code);
			}
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("atxHeading");
				return ok(code);
			}
			if (markdownSpace$1(code)) return factorySpace$1(effects, atBreak, "whitespace")(code);
			effects.enter("atxHeadingText");
			return data(code);
		}
		/**
		* In further sequence (after whitespace).
		*
		* Could be normal “visible” hashes in the heading or a final sequence.
		*
		* ```markdown
		* > | ## aa ##
		*           ^
		* ```
		*
		* @type {State}
		*/
		function sequenceFurther(code) {
			if (code === 35) {
				effects.consume(code);
				return sequenceFurther;
			}
			effects.exit("atxHeadingSequence");
			return atBreak(code);
		}
		/**
		* In text.
		*
		* ```markdown
		* > | ## aa
		*        ^
		* ```
		*
		* @type {State}
		*/
		function data(code) {
			if (code === null || code === 35 || markdownLineEndingOrSpace$1(code)) {
				effects.exit("atxHeadingText");
				return atBreak(code);
			}
			effects.consume(code);
			return data;
		}
	}
	//#endregion
	//#region node_modules/micromark-util-html-tag-name/index.js
	/**
	* List of lowercase HTML “block” tag names.
	*
	* The list, when parsing HTML (flow), results in more relaxed rules (condition
	* 6).
	* Because they are known blocks, the HTML-like syntax doesn’t have to be
	* strictly parsed.
	* For tag names not in this list, a more strict algorithm (condition 7) is used
	* to detect whether the HTML-like syntax is seen as HTML (flow) or not.
	*
	* This is copied from:
	* <https://spec.commonmark.org/0.30/#html-blocks>.
	*
	* > 👉 **Note**: `search` was added in `CommonMark@0.31`.
	*/
	var htmlBlockNames = [
		"address",
		"article",
		"aside",
		"base",
		"basefont",
		"blockquote",
		"body",
		"caption",
		"center",
		"col",
		"colgroup",
		"dd",
		"details",
		"dialog",
		"dir",
		"div",
		"dl",
		"dt",
		"fieldset",
		"figcaption",
		"figure",
		"footer",
		"form",
		"frame",
		"frameset",
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
		"head",
		"header",
		"hr",
		"html",
		"iframe",
		"legend",
		"li",
		"link",
		"main",
		"menu",
		"menuitem",
		"nav",
		"noframes",
		"ol",
		"optgroup",
		"option",
		"p",
		"param",
		"search",
		"section",
		"summary",
		"table",
		"tbody",
		"td",
		"tfoot",
		"th",
		"thead",
		"title",
		"tr",
		"track",
		"ul"
	];
	/**
	* List of lowercase HTML “raw” tag names.
	*
	* The list, when parsing HTML (flow), results in HTML that can include lines
	* without exiting, until a closing tag also in this list is found (condition
	* 1).
	*
	* This module is copied from:
	* <https://spec.commonmark.org/0.30/#html-blocks>.
	*
	* > 👉 **Note**: `textarea` was added in `CommonMark@0.30`.
	*/
	var htmlRawNames = [
		"pre",
		"script",
		"style",
		"textarea"
	];
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/html-flow.js
	/**
	* @import {
	*   Code,
	*   Construct,
	*   Resolver,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var htmlFlow = {
		concrete: true,
		name: "htmlFlow",
		resolveTo: resolveToHtmlFlow,
		tokenize: tokenizeHtmlFlow
	};
	/** @type {Construct} */
	var blankLineBefore = {
		partial: true,
		tokenize: tokenizeBlankLineBefore
	};
	var nonLazyContinuationStart = {
		partial: true,
		tokenize: tokenizeNonLazyContinuationStart
	};
	/** @type {Resolver} */
	function resolveToHtmlFlow(events) {
		let index = events.length;
		while (index--) if (events[index][0] === "enter" && events[index][1].type === "htmlFlow") break;
		if (index > 1 && events[index - 2][1].type === "linePrefix") {
			events[index][1].start = events[index - 2][1].start;
			events[index + 1][1].start = events[index - 2][1].start;
			events.splice(index - 2, 2);
		}
		return events;
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeHtmlFlow(effects, ok, nok) {
		const self = this;
		/** @type {number} */
		let marker;
		/** @type {boolean} */
		let closingTag;
		/** @type {string} */
		let buffer;
		/** @type {number} */
		let index;
		/** @type {Code} */
		let markerB;
		return start;
		/**
		* Start of HTML (flow).
		*
		* ```markdown
		* > | <x />
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			return before(code);
		}
		/**
		* At `<`, after optional whitespace.
		*
		* ```markdown
		* > | <x />
		*     ^
		* ```
		*
		* @type {State}
		*/
		function before(code) {
			effects.enter("htmlFlow");
			effects.enter("htmlFlowData");
			effects.consume(code);
			return open;
		}
		/**
		* After `<`, at tag name or other stuff.
		*
		* ```markdown
		* > | <x />
		*      ^
		* > | <!doctype>
		*      ^
		* > | <!--xxx-->
		*      ^
		* ```
		*
		* @type {State}
		*/
		function open(code) {
			if (code === 33) {
				effects.consume(code);
				return declarationOpen;
			}
			if (code === 47) {
				effects.consume(code);
				closingTag = true;
				return tagCloseStart;
			}
			if (code === 63) {
				effects.consume(code);
				marker = 3;
				return self.interrupt ? ok : continuationDeclarationInside;
			}
			if (asciiAlpha$1(code)) {
				effects.consume(code);
				buffer = String.fromCharCode(code);
				return tagName;
			}
			return nok(code);
		}
		/**
		* After `<!`, at declaration, comment, or CDATA.
		*
		* ```markdown
		* > | <!doctype>
		*       ^
		* > | <!--xxx-->
		*       ^
		* > | <![CDATA[>&<]]>
		*       ^
		* ```
		*
		* @type {State}
		*/
		function declarationOpen(code) {
			if (code === 45) {
				effects.consume(code);
				marker = 2;
				return commentOpenInside;
			}
			if (code === 91) {
				effects.consume(code);
				marker = 5;
				index = 0;
				return cdataOpenInside;
			}
			if (asciiAlpha$1(code)) {
				effects.consume(code);
				marker = 4;
				return self.interrupt ? ok : continuationDeclarationInside;
			}
			return nok(code);
		}
		/**
		* After `<!-`, inside a comment, at another `-`.
		*
		* ```markdown
		* > | <!--xxx-->
		*        ^
		* ```
		*
		* @type {State}
		*/
		function commentOpenInside(code) {
			if (code === 45) {
				effects.consume(code);
				return self.interrupt ? ok : continuationDeclarationInside;
			}
			return nok(code);
		}
		/**
		* After `<![`, inside CDATA, expecting `CDATA[`.
		*
		* ```markdown
		* > | <![CDATA[>&<]]>
		*        ^^^^^^
		* ```
		*
		* @type {State}
		*/
		function cdataOpenInside(code) {
			if (code === "CDATA[".charCodeAt(index++)) {
				effects.consume(code);
				if (index === 6) return self.interrupt ? ok : continuation;
				return cdataOpenInside;
			}
			return nok(code);
		}
		/**
		* After `</`, in closing tag, at tag name.
		*
		* ```markdown
		* > | </x>
		*       ^
		* ```
		*
		* @type {State}
		*/
		function tagCloseStart(code) {
			if (asciiAlpha$1(code)) {
				effects.consume(code);
				buffer = String.fromCharCode(code);
				return tagName;
			}
			return nok(code);
		}
		/**
		* In tag name.
		*
		* ```markdown
		* > | <ab>
		*      ^^
		* > | </ab>
		*       ^^
		* ```
		*
		* @type {State}
		*/
		function tagName(code) {
			if (code === null || code === 47 || code === 62 || markdownLineEndingOrSpace$1(code)) {
				const slash = code === 47;
				const name = buffer.toLowerCase();
				if (!slash && !closingTag && htmlRawNames.includes(name)) {
					marker = 1;
					return self.interrupt ? ok(code) : continuation(code);
				}
				if (htmlBlockNames.includes(buffer.toLowerCase())) {
					marker = 6;
					if (slash) {
						effects.consume(code);
						return basicSelfClosing;
					}
					return self.interrupt ? ok(code) : continuation(code);
				}
				marker = 7;
				return self.interrupt && !self.parser.lazy[self.now().line] ? nok(code) : closingTag ? completeClosingTagAfter(code) : completeAttributeNameBefore(code);
			}
			if (code === 45 || asciiAlphanumeric$1(code)) {
				effects.consume(code);
				buffer += String.fromCharCode(code);
				return tagName;
			}
			return nok(code);
		}
		/**
		* After closing slash of a basic tag name.
		*
		* ```markdown
		* > | <div/>
		*          ^
		* ```
		*
		* @type {State}
		*/
		function basicSelfClosing(code) {
			if (code === 62) {
				effects.consume(code);
				return self.interrupt ? ok : continuation;
			}
			return nok(code);
		}
		/**
		* After closing slash of a complete tag name.
		*
		* ```markdown
		* > | <x/>
		*        ^
		* ```
		*
		* @type {State}
		*/
		function completeClosingTagAfter(code) {
			if (markdownSpace$1(code)) {
				effects.consume(code);
				return completeClosingTagAfter;
			}
			return completeEnd(code);
		}
		/**
		* At an attribute name.
		*
		* At first, this state is used after a complete tag name, after whitespace,
		* where it expects optional attributes or the end of the tag.
		* It is also reused after attributes, when expecting more optional
		* attributes.
		*
		* ```markdown
		* > | <a />
		*        ^
		* > | <a :b>
		*        ^
		* > | <a _b>
		*        ^
		* > | <a b>
		*        ^
		* > | <a >
		*        ^
		* ```
		*
		* @type {State}
		*/
		function completeAttributeNameBefore(code) {
			if (code === 47) {
				effects.consume(code);
				return completeEnd;
			}
			if (code === 58 || code === 95 || asciiAlpha$1(code)) {
				effects.consume(code);
				return completeAttributeName;
			}
			if (markdownSpace$1(code)) {
				effects.consume(code);
				return completeAttributeNameBefore;
			}
			return completeEnd(code);
		}
		/**
		* In attribute name.
		*
		* ```markdown
		* > | <a :b>
		*         ^
		* > | <a _b>
		*         ^
		* > | <a b>
		*         ^
		* ```
		*
		* @type {State}
		*/
		function completeAttributeName(code) {
			if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric$1(code)) {
				effects.consume(code);
				return completeAttributeName;
			}
			return completeAttributeNameAfter(code);
		}
		/**
		* After attribute name, at an optional initializer, the end of the tag, or
		* whitespace.
		*
		* ```markdown
		* > | <a b>
		*         ^
		* > | <a b=c>
		*         ^
		* ```
		*
		* @type {State}
		*/
		function completeAttributeNameAfter(code) {
			if (code === 61) {
				effects.consume(code);
				return completeAttributeValueBefore;
			}
			if (markdownSpace$1(code)) {
				effects.consume(code);
				return completeAttributeNameAfter;
			}
			return completeAttributeNameBefore(code);
		}
		/**
		* Before unquoted, double quoted, or single quoted attribute value, allowing
		* whitespace.
		*
		* ```markdown
		* > | <a b=c>
		*          ^
		* > | <a b="c">
		*          ^
		* ```
		*
		* @type {State}
		*/
		function completeAttributeValueBefore(code) {
			if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
			if (code === 34 || code === 39) {
				effects.consume(code);
				markerB = code;
				return completeAttributeValueQuoted;
			}
			if (markdownSpace$1(code)) {
				effects.consume(code);
				return completeAttributeValueBefore;
			}
			return completeAttributeValueUnquoted(code);
		}
		/**
		* In double or single quoted attribute value.
		*
		* ```markdown
		* > | <a b="c">
		*           ^
		* > | <a b='c'>
		*           ^
		* ```
		*
		* @type {State}
		*/
		function completeAttributeValueQuoted(code) {
			if (code === markerB) {
				effects.consume(code);
				markerB = null;
				return completeAttributeValueQuotedAfter;
			}
			if (code === null || markdownLineEnding$1(code)) return nok(code);
			effects.consume(code);
			return completeAttributeValueQuoted;
		}
		/**
		* In unquoted attribute value.
		*
		* ```markdown
		* > | <a b=c>
		*          ^
		* ```
		*
		* @type {State}
		*/
		function completeAttributeValueUnquoted(code) {
			if (code === null || code === 34 || code === 39 || code === 47 || code === 60 || code === 61 || code === 62 || code === 96 || markdownLineEndingOrSpace$1(code)) return completeAttributeNameAfter(code);
			effects.consume(code);
			return completeAttributeValueUnquoted;
		}
		/**
		* After double or single quoted attribute value, before whitespace or the
		* end of the tag.
		*
		* ```markdown
		* > | <a b="c">
		*            ^
		* ```
		*
		* @type {State}
		*/
		function completeAttributeValueQuotedAfter(code) {
			if (code === 47 || code === 62 || markdownSpace$1(code)) return completeAttributeNameBefore(code);
			return nok(code);
		}
		/**
		* In certain circumstances of a complete tag where only an `>` is allowed.
		*
		* ```markdown
		* > | <a b="c">
		*             ^
		* ```
		*
		* @type {State}
		*/
		function completeEnd(code) {
			if (code === 62) {
				effects.consume(code);
				return completeAfter;
			}
			return nok(code);
		}
		/**
		* After `>` in a complete tag.
		*
		* ```markdown
		* > | <x>
		*        ^
		* ```
		*
		* @type {State}
		*/
		function completeAfter(code) {
			if (code === null || markdownLineEnding$1(code)) return continuation(code);
			if (markdownSpace$1(code)) {
				effects.consume(code);
				return completeAfter;
			}
			return nok(code);
		}
		/**
		* In continuation of any HTML kind.
		*
		* ```markdown
		* > | <!--xxx-->
		*          ^
		* ```
		*
		* @type {State}
		*/
		function continuation(code) {
			if (code === 45 && marker === 2) {
				effects.consume(code);
				return continuationCommentInside;
			}
			if (code === 60 && marker === 1) {
				effects.consume(code);
				return continuationRawTagOpen;
			}
			if (code === 62 && marker === 4) {
				effects.consume(code);
				return continuationClose;
			}
			if (code === 63 && marker === 3) {
				effects.consume(code);
				return continuationDeclarationInside;
			}
			if (code === 93 && marker === 5) {
				effects.consume(code);
				return continuationCdataInside;
			}
			if (markdownLineEnding$1(code) && (marker === 6 || marker === 7)) {
				effects.exit("htmlFlowData");
				return effects.check(blankLineBefore, continuationAfter, continuationStart)(code);
			}
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("htmlFlowData");
				return continuationStart(code);
			}
			effects.consume(code);
			return continuation;
		}
		/**
		* In continuation, at eol.
		*
		* ```markdown
		* > | <x>
		*        ^
		*   | asd
		* ```
		*
		* @type {State}
		*/
		function continuationStart(code) {
			return effects.check(nonLazyContinuationStart, continuationStartNonLazy, continuationAfter)(code);
		}
		/**
		* In continuation, at eol, before non-lazy content.
		*
		* ```markdown
		* > | <x>
		*        ^
		*   | asd
		* ```
		*
		* @type {State}
		*/
		function continuationStartNonLazy(code) {
			effects.enter("lineEnding");
			effects.consume(code);
			effects.exit("lineEnding");
			return continuationBefore;
		}
		/**
		* In continuation, before non-lazy content.
		*
		* ```markdown
		*   | <x>
		* > | asd
		*     ^
		* ```
		*
		* @type {State}
		*/
		function continuationBefore(code) {
			if (code === null || markdownLineEnding$1(code)) return continuationStart(code);
			effects.enter("htmlFlowData");
			return continuation(code);
		}
		/**
		* In comment continuation, after one `-`, expecting another.
		*
		* ```markdown
		* > | <!--xxx-->
		*             ^
		* ```
		*
		* @type {State}
		*/
		function continuationCommentInside(code) {
			if (code === 45) {
				effects.consume(code);
				return continuationDeclarationInside;
			}
			return continuation(code);
		}
		/**
		* In raw continuation, after `<`, at `/`.
		*
		* ```markdown
		* > | <script>console.log(1)<\/script>
		*                            ^
		* ```
		*
		* @type {State}
		*/
		function continuationRawTagOpen(code) {
			if (code === 47) {
				effects.consume(code);
				buffer = "";
				return continuationRawEndTag;
			}
			return continuation(code);
		}
		/**
		* In raw continuation, after `</`, in a raw tag name.
		*
		* ```markdown
		* > | <script>console.log(1)<\/script>
		*                             ^^^^^^
		* ```
		*
		* @type {State}
		*/
		function continuationRawEndTag(code) {
			if (code === 62) {
				const name = buffer.toLowerCase();
				if (htmlRawNames.includes(name)) {
					effects.consume(code);
					return continuationClose;
				}
				return continuation(code);
			}
			if (asciiAlpha$1(code) && buffer.length < 8) {
				effects.consume(code);
				buffer += String.fromCharCode(code);
				return continuationRawEndTag;
			}
			return continuation(code);
		}
		/**
		* In cdata continuation, after `]`, expecting `]>`.
		*
		* ```markdown
		* > | <![CDATA[>&<]]>
		*                  ^
		* ```
		*
		* @type {State}
		*/
		function continuationCdataInside(code) {
			if (code === 93) {
				effects.consume(code);
				return continuationDeclarationInside;
			}
			return continuation(code);
		}
		/**
		* In declaration or instruction continuation, at `>`.
		*
		* ```markdown
		* > | <!-->
		*         ^
		* > | <?>
		*       ^
		* > | <!q>
		*        ^
		* > | <!--ab-->
		*             ^
		* > | <![CDATA[>&<]]>
		*                   ^
		* ```
		*
		* @type {State}
		*/
		function continuationDeclarationInside(code) {
			if (code === 62) {
				effects.consume(code);
				return continuationClose;
			}
			if (code === 45 && marker === 2) {
				effects.consume(code);
				return continuationDeclarationInside;
			}
			return continuation(code);
		}
		/**
		* In closed continuation: everything we get until the eol/eof is part of it.
		*
		* ```markdown
		* > | <!doctype>
		*               ^
		* ```
		*
		* @type {State}
		*/
		function continuationClose(code) {
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("htmlFlowData");
				return continuationAfter(code);
			}
			effects.consume(code);
			return continuationClose;
		}
		/**
		* Done.
		*
		* ```markdown
		* > | <!doctype>
		*               ^
		* ```
		*
		* @type {State}
		*/
		function continuationAfter(code) {
			effects.exit("htmlFlow");
			return ok(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeNonLazyContinuationStart(effects, ok, nok) {
		const self = this;
		return start;
		/**
		* At eol, before continuation.
		*
		* ```markdown
		* > | * ```js
		*            ^
		*   | b
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			if (markdownLineEnding$1(code)) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return after;
			}
			return nok(code);
		}
		/**
		* A continuation.
		*
		* ```markdown
		*   | * ```js
		* > | b
		*     ^
		* ```
		*
		* @type {State}
		*/
		function after(code) {
			return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeBlankLineBefore(effects, ok, nok) {
		return start;
		/**
		* Before eol, expecting blank line.
		*
		* ```markdown
		* > | <div>
		*          ^
		*   |
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("lineEnding");
			effects.consume(code);
			effects.exit("lineEnding");
			return effects.attempt(blankLine, ok, nok);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/html-text.js
	/**
	* @import {
	*   Code,
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var htmlText = {
		name: "htmlText",
		tokenize: tokenizeHtmlText
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeHtmlText(effects, ok, nok) {
		const self = this;
		/** @type {NonNullable<Code> | undefined} */
		let marker;
		/** @type {number} */
		let index;
		/** @type {State} */
		let returnState;
		return start;
		/**
		* Start of HTML (text).
		*
		* ```markdown
		* > | a <b> c
		*       ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("htmlText");
			effects.enter("htmlTextData");
			effects.consume(code);
			return open;
		}
		/**
		* After `<`, at tag name or other stuff.
		*
		* ```markdown
		* > | a <b> c
		*        ^
		* > | a <!doctype> c
		*        ^
		* > | a <!--b--> c
		*        ^
		* ```
		*
		* @type {State}
		*/
		function open(code) {
			if (code === 33) {
				effects.consume(code);
				return declarationOpen;
			}
			if (code === 47) {
				effects.consume(code);
				return tagCloseStart;
			}
			if (code === 63) {
				effects.consume(code);
				return instruction;
			}
			if (asciiAlpha$1(code)) {
				effects.consume(code);
				return tagOpen;
			}
			return nok(code);
		}
		/**
		* After `<!`, at declaration, comment, or CDATA.
		*
		* ```markdown
		* > | a <!doctype> c
		*         ^
		* > | a <!--b--> c
		*         ^
		* > | a <![CDATA[>&<]]> c
		*         ^
		* ```
		*
		* @type {State}
		*/
		function declarationOpen(code) {
			if (code === 45) {
				effects.consume(code);
				return commentOpenInside;
			}
			if (code === 91) {
				effects.consume(code);
				index = 0;
				return cdataOpenInside;
			}
			if (asciiAlpha$1(code)) {
				effects.consume(code);
				return declaration;
			}
			return nok(code);
		}
		/**
		* In a comment, after `<!-`, at another `-`.
		*
		* ```markdown
		* > | a <!--b--> c
		*          ^
		* ```
		*
		* @type {State}
		*/
		function commentOpenInside(code) {
			if (code === 45) {
				effects.consume(code);
				return commentEnd;
			}
			return nok(code);
		}
		/**
		* In comment.
		*
		* ```markdown
		* > | a <!--b--> c
		*           ^
		* ```
		*
		* @type {State}
		*/
		function comment(code) {
			if (code === null) return nok(code);
			if (code === 45) {
				effects.consume(code);
				return commentClose;
			}
			if (markdownLineEnding$1(code)) {
				returnState = comment;
				return lineEndingBefore(code);
			}
			effects.consume(code);
			return comment;
		}
		/**
		* In comment, after `-`.
		*
		* ```markdown
		* > | a <!--b--> c
		*             ^
		* ```
		*
		* @type {State}
		*/
		function commentClose(code) {
			if (code === 45) {
				effects.consume(code);
				return commentEnd;
			}
			return comment(code);
		}
		/**
		* In comment, after `--`.
		*
		* ```markdown
		* > | a <!--b--> c
		*              ^
		* ```
		*
		* @type {State}
		*/
		function commentEnd(code) {
			return code === 62 ? end(code) : code === 45 ? commentClose(code) : comment(code);
		}
		/**
		* After `<![`, in CDATA, expecting `CDATA[`.
		*
		* ```markdown
		* > | a <![CDATA[>&<]]> b
		*          ^^^^^^
		* ```
		*
		* @type {State}
		*/
		function cdataOpenInside(code) {
			if (code === "CDATA[".charCodeAt(index++)) {
				effects.consume(code);
				return index === 6 ? cdata : cdataOpenInside;
			}
			return nok(code);
		}
		/**
		* In CDATA.
		*
		* ```markdown
		* > | a <![CDATA[>&<]]> b
		*                ^^^
		* ```
		*
		* @type {State}
		*/
		function cdata(code) {
			if (code === null) return nok(code);
			if (code === 93) {
				effects.consume(code);
				return cdataClose;
			}
			if (markdownLineEnding$1(code)) {
				returnState = cdata;
				return lineEndingBefore(code);
			}
			effects.consume(code);
			return cdata;
		}
		/**
		* In CDATA, after `]`, at another `]`.
		*
		* ```markdown
		* > | a <![CDATA[>&<]]> b
		*                    ^
		* ```
		*
		* @type {State}
		*/
		function cdataClose(code) {
			if (code === 93) {
				effects.consume(code);
				return cdataEnd;
			}
			return cdata(code);
		}
		/**
		* In CDATA, after `]]`, at `>`.
		*
		* ```markdown
		* > | a <![CDATA[>&<]]> b
		*                     ^
		* ```
		*
		* @type {State}
		*/
		function cdataEnd(code) {
			if (code === 62) return end(code);
			if (code === 93) {
				effects.consume(code);
				return cdataEnd;
			}
			return cdata(code);
		}
		/**
		* In declaration.
		*
		* ```markdown
		* > | a <!b> c
		*          ^
		* ```
		*
		* @type {State}
		*/
		function declaration(code) {
			if (code === null || code === 62) return end(code);
			if (markdownLineEnding$1(code)) {
				returnState = declaration;
				return lineEndingBefore(code);
			}
			effects.consume(code);
			return declaration;
		}
		/**
		* In instruction.
		*
		* ```markdown
		* > | a <?b?> c
		*         ^
		* ```
		*
		* @type {State}
		*/
		function instruction(code) {
			if (code === null) return nok(code);
			if (code === 63) {
				effects.consume(code);
				return instructionClose;
			}
			if (markdownLineEnding$1(code)) {
				returnState = instruction;
				return lineEndingBefore(code);
			}
			effects.consume(code);
			return instruction;
		}
		/**
		* In instruction, after `?`, at `>`.
		*
		* ```markdown
		* > | a <?b?> c
		*           ^
		* ```
		*
		* @type {State}
		*/
		function instructionClose(code) {
			return code === 62 ? end(code) : instruction(code);
		}
		/**
		* After `</`, in closing tag, at tag name.
		*
		* ```markdown
		* > | a </b> c
		*         ^
		* ```
		*
		* @type {State}
		*/
		function tagCloseStart(code) {
			if (asciiAlpha$1(code)) {
				effects.consume(code);
				return tagClose;
			}
			return nok(code);
		}
		/**
		* After `</x`, in a tag name.
		*
		* ```markdown
		* > | a </b> c
		*          ^
		* ```
		*
		* @type {State}
		*/
		function tagClose(code) {
			if (code === 45 || asciiAlphanumeric$1(code)) {
				effects.consume(code);
				return tagClose;
			}
			return tagCloseBetween(code);
		}
		/**
		* In closing tag, after tag name.
		*
		* ```markdown
		* > | a </b> c
		*          ^
		* ```
		*
		* @type {State}
		*/
		function tagCloseBetween(code) {
			if (markdownLineEnding$1(code)) {
				returnState = tagCloseBetween;
				return lineEndingBefore(code);
			}
			if (markdownSpace$1(code)) {
				effects.consume(code);
				return tagCloseBetween;
			}
			return end(code);
		}
		/**
		* After `<x`, in opening tag name.
		*
		* ```markdown
		* > | a <b> c
		*         ^
		* ```
		*
		* @type {State}
		*/
		function tagOpen(code) {
			if (code === 45 || asciiAlphanumeric$1(code)) {
				effects.consume(code);
				return tagOpen;
			}
			if (code === 47 || code === 62 || markdownLineEndingOrSpace$1(code)) return tagOpenBetween(code);
			return nok(code);
		}
		/**
		* In opening tag, after tag name.
		*
		* ```markdown
		* > | a <b> c
		*         ^
		* ```
		*
		* @type {State}
		*/
		function tagOpenBetween(code) {
			if (code === 47) {
				effects.consume(code);
				return end;
			}
			if (code === 58 || code === 95 || asciiAlpha$1(code)) {
				effects.consume(code);
				return tagOpenAttributeName;
			}
			if (markdownLineEnding$1(code)) {
				returnState = tagOpenBetween;
				return lineEndingBefore(code);
			}
			if (markdownSpace$1(code)) {
				effects.consume(code);
				return tagOpenBetween;
			}
			return end(code);
		}
		/**
		* In attribute name.
		*
		* ```markdown
		* > | a <b c> d
		*          ^
		* ```
		*
		* @type {State}
		*/
		function tagOpenAttributeName(code) {
			if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric$1(code)) {
				effects.consume(code);
				return tagOpenAttributeName;
			}
			return tagOpenAttributeNameAfter(code);
		}
		/**
		* After attribute name, before initializer, the end of the tag, or
		* whitespace.
		*
		* ```markdown
		* > | a <b c> d
		*           ^
		* ```
		*
		* @type {State}
		*/
		function tagOpenAttributeNameAfter(code) {
			if (code === 61) {
				effects.consume(code);
				return tagOpenAttributeValueBefore;
			}
			if (markdownLineEnding$1(code)) {
				returnState = tagOpenAttributeNameAfter;
				return lineEndingBefore(code);
			}
			if (markdownSpace$1(code)) {
				effects.consume(code);
				return tagOpenAttributeNameAfter;
			}
			return tagOpenBetween(code);
		}
		/**
		* Before unquoted, double quoted, or single quoted attribute value, allowing
		* whitespace.
		*
		* ```markdown
		* > | a <b c=d> e
		*            ^
		* ```
		*
		* @type {State}
		*/
		function tagOpenAttributeValueBefore(code) {
			if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
			if (code === 34 || code === 39) {
				effects.consume(code);
				marker = code;
				return tagOpenAttributeValueQuoted;
			}
			if (markdownLineEnding$1(code)) {
				returnState = tagOpenAttributeValueBefore;
				return lineEndingBefore(code);
			}
			if (markdownSpace$1(code)) {
				effects.consume(code);
				return tagOpenAttributeValueBefore;
			}
			effects.consume(code);
			return tagOpenAttributeValueUnquoted;
		}
		/**
		* In double or single quoted attribute value.
		*
		* ```markdown
		* > | a <b c="d"> e
		*             ^
		* ```
		*
		* @type {State}
		*/
		function tagOpenAttributeValueQuoted(code) {
			if (code === marker) {
				effects.consume(code);
				marker = void 0;
				return tagOpenAttributeValueQuotedAfter;
			}
			if (code === null) return nok(code);
			if (markdownLineEnding$1(code)) {
				returnState = tagOpenAttributeValueQuoted;
				return lineEndingBefore(code);
			}
			effects.consume(code);
			return tagOpenAttributeValueQuoted;
		}
		/**
		* In unquoted attribute value.
		*
		* ```markdown
		* > | a <b c=d> e
		*            ^
		* ```
		*
		* @type {State}
		*/
		function tagOpenAttributeValueUnquoted(code) {
			if (code === null || code === 34 || code === 39 || code === 60 || code === 61 || code === 96) return nok(code);
			if (code === 47 || code === 62 || markdownLineEndingOrSpace$1(code)) return tagOpenBetween(code);
			effects.consume(code);
			return tagOpenAttributeValueUnquoted;
		}
		/**
		* After double or single quoted attribute value, before whitespace or the end
		* of the tag.
		*
		* ```markdown
		* > | a <b c="d"> e
		*               ^
		* ```
		*
		* @type {State}
		*/
		function tagOpenAttributeValueQuotedAfter(code) {
			if (code === 47 || code === 62 || markdownLineEndingOrSpace$1(code)) return tagOpenBetween(code);
			return nok(code);
		}
		/**
		* In certain circumstances of a tag where only an `>` is allowed.
		*
		* ```markdown
		* > | a <b c="d"> e
		*               ^
		* ```
		*
		* @type {State}
		*/
		function end(code) {
			if (code === 62) {
				effects.consume(code);
				effects.exit("htmlTextData");
				effects.exit("htmlText");
				return ok;
			}
			return nok(code);
		}
		/**
		* At eol.
		*
		* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
		* > empty tokens.
		*
		* ```markdown
		* > | a <!--a
		*            ^
		*   | b-->
		* ```
		*
		* @type {State}
		*/
		function lineEndingBefore(code) {
			effects.exit("htmlTextData");
			effects.enter("lineEnding");
			effects.consume(code);
			effects.exit("lineEnding");
			return lineEndingAfter;
		}
		/**
		* After eol, at optional whitespace.
		*
		* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
		* > empty tokens.
		*
		* ```markdown
		*   | a <!--a
		* > | b-->
		*     ^
		* ```
		*
		* @type {State}
		*/
		function lineEndingAfter(code) {
			return markdownSpace$1(code) ? factorySpace$1(effects, lineEndingAfterPrefix, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : lineEndingAfterPrefix(code);
		}
		/**
		* After eol, after optional whitespace.
		*
		* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
		* > empty tokens.
		*
		* ```markdown
		*   | a <!--a
		* > | b-->
		*     ^
		* ```
		*
		* @type {State}
		*/
		function lineEndingAfterPrefix(code) {
			effects.enter("htmlTextData");
			return returnState(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/label-end.js
	/**
	* @import {
	*   Construct,
	*   Event,
	*   Resolver,
	*   State,
	*   TokenizeContext,
	*   Tokenizer,
	*   Token
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var labelEnd = {
		name: "labelEnd",
		resolveAll: resolveAllLabelEnd,
		resolveTo: resolveToLabelEnd,
		tokenize: tokenizeLabelEnd
	};
	/** @type {Construct} */
	var resourceConstruct = { tokenize: tokenizeResource };
	/** @type {Construct} */
	var referenceFullConstruct = { tokenize: tokenizeReferenceFull };
	/** @type {Construct} */
	var referenceCollapsedConstruct = { tokenize: tokenizeReferenceCollapsed };
	/** @type {Resolver} */
	function resolveAllLabelEnd(events) {
		let index = -1;
		/** @type {Array<Event>} */
		const newEvents = [];
		while (++index < events.length) {
			const token = events[index][1];
			newEvents.push(events[index]);
			if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
				const offset = token.type === "labelImage" ? 4 : 2;
				token.type = "data";
				index += offset;
			}
		}
		if (events.length !== newEvents.length) splice$1(events, 0, events.length, newEvents);
		return events;
	}
	/** @type {Resolver} */
	function resolveToLabelEnd(events, context) {
		let index = events.length;
		let offset = 0;
		/** @type {Token} */
		let token;
		/** @type {number | undefined} */
		let open;
		/** @type {number | undefined} */
		let close;
		/** @type {Array<Event>} */
		let media;
		while (index--) {
			token = events[index][1];
			if (open) {
				if (token.type === "link" || token.type === "labelLink" && token._inactive) break;
				if (events[index][0] === "enter" && token.type === "labelLink") token._inactive = true;
			} else if (close) {
				if (events[index][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
					open = index;
					if (token.type !== "labelLink") {
						offset = 2;
						break;
					}
				}
			} else if (token.type === "labelEnd") close = index;
		}
		const group = {
			type: events[open][1].type === "labelLink" ? "link" : "image",
			start: { ...events[open][1].start },
			end: { ...events[events.length - 1][1].end }
		};
		const label = {
			type: "label",
			start: { ...events[open][1].start },
			end: { ...events[close][1].end }
		};
		const text = {
			type: "labelText",
			start: { ...events[open + offset + 2][1].end },
			end: { ...events[close - 2][1].start }
		};
		media = [[
			"enter",
			group,
			context
		], [
			"enter",
			label,
			context
		]];
		media = push(media, events.slice(open + 1, open + offset + 3));
		media = push(media, [[
			"enter",
			text,
			context
		]]);
		media = push(media, resolveAll$1(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
		media = push(media, [
			[
				"exit",
				text,
				context
			],
			events[close - 2],
			events[close - 1],
			[
				"exit",
				label,
				context
			]
		]);
		media = push(media, events.slice(close + 1));
		media = push(media, [[
			"exit",
			group,
			context
		]]);
		splice$1(events, open, events.length, media);
		return events;
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeLabelEnd(effects, ok, nok) {
		const self = this;
		let index = self.events.length;
		/** @type {Token} */
		let labelStart;
		/** @type {boolean} */
		let defined;
		while (index--) if ((self.events[index][1].type === "labelImage" || self.events[index][1].type === "labelLink") && !self.events[index][1]._balanced) {
			labelStart = self.events[index][1];
			break;
		}
		return start;
		/**
		* Start of label end.
		*
		* ```markdown
		* > | [a](b) c
		*       ^
		* > | [a][b] c
		*       ^
		* > | [a][] b
		*       ^
		* > | [a] b
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			if (!labelStart) return nok(code);
			if (labelStart._inactive) return labelEndNok(code);
			defined = self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize({
				start: labelStart.end,
				end: self.now()
			})));
			effects.enter("labelEnd");
			effects.enter("labelMarker");
			effects.consume(code);
			effects.exit("labelMarker");
			effects.exit("labelEnd");
			return after;
		}
		/**
		* After `]`.
		*
		* ```markdown
		* > | [a](b) c
		*       ^
		* > | [a][b] c
		*       ^
		* > | [a][] b
		*       ^
		* > | [a] b
		*       ^
		* ```
		*
		* @type {State}
		*/
		function after(code) {
			if (code === 40) return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code);
			if (code === 91) return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code);
			return defined ? labelEndOk(code) : labelEndNok(code);
		}
		/**
		* After `]`, at `[`, but not at a full reference.
		*
		* > 👉 **Note**: we only get here if the label is defined.
		*
		* ```markdown
		* > | [a][] b
		*        ^
		* > | [a] b
		*        ^
		* ```
		*
		* @type {State}
		*/
		function referenceNotFull(code) {
			return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code);
		}
		/**
		* Done, we found something.
		*
		* ```markdown
		* > | [a](b) c
		*           ^
		* > | [a][b] c
		*           ^
		* > | [a][] b
		*          ^
		* > | [a] b
		*        ^
		* ```
		*
		* @type {State}
		*/
		function labelEndOk(code) {
			return ok(code);
		}
		/**
		* Done, it’s nothing.
		*
		* There was an okay opening, but we didn’t match anything.
		*
		* ```markdown
		* > | [a](b c
		*        ^
		* > | [a][b c
		*        ^
		* > | [a] b
		*        ^
		* ```
		*
		* @type {State}
		*/
		function labelEndNok(code) {
			labelStart._balanced = true;
			return nok(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeResource(effects, ok, nok) {
		return resourceStart;
		/**
		* At a resource.
		*
		* ```markdown
		* > | [a](b) c
		*        ^
		* ```
		*
		* @type {State}
		*/
		function resourceStart(code) {
			effects.enter("resource");
			effects.enter("resourceMarker");
			effects.consume(code);
			effects.exit("resourceMarker");
			return resourceBefore;
		}
		/**
		* In resource, after `(`, at optional whitespace.
		*
		* ```markdown
		* > | [a](b) c
		*         ^
		* ```
		*
		* @type {State}
		*/
		function resourceBefore(code) {
			return markdownLineEndingOrSpace$1(code) ? factoryWhitespace(effects, resourceOpen)(code) : resourceOpen(code);
		}
		/**
		* In resource, after optional whitespace, at `)` or a destination.
		*
		* ```markdown
		* > | [a](b) c
		*         ^
		* ```
		*
		* @type {State}
		*/
		function resourceOpen(code) {
			if (code === 41) return resourceEnd(code);
			return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code);
		}
		/**
		* In resource, after destination, at optional whitespace.
		*
		* ```markdown
		* > | [a](b) c
		*          ^
		* ```
		*
		* @type {State}
		*/
		function resourceDestinationAfter(code) {
			return markdownLineEndingOrSpace$1(code) ? factoryWhitespace(effects, resourceBetween)(code) : resourceEnd(code);
		}
		/**
		* At invalid destination.
		*
		* ```markdown
		* > | [a](<<) b
		*         ^
		* ```
		*
		* @type {State}
		*/
		function resourceDestinationMissing(code) {
			return nok(code);
		}
		/**
		* In resource, after destination and whitespace, at `(` or title.
		*
		* ```markdown
		* > | [a](b ) c
		*           ^
		* ```
		*
		* @type {State}
		*/
		function resourceBetween(code) {
			if (code === 34 || code === 39 || code === 40) return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code);
			return resourceEnd(code);
		}
		/**
		* In resource, after title, at optional whitespace.
		*
		* ```markdown
		* > | [a](b "c") d
		*              ^
		* ```
		*
		* @type {State}
		*/
		function resourceTitleAfter(code) {
			return markdownLineEndingOrSpace$1(code) ? factoryWhitespace(effects, resourceEnd)(code) : resourceEnd(code);
		}
		/**
		* In resource, at `)`.
		*
		* ```markdown
		* > | [a](b) d
		*          ^
		* ```
		*
		* @type {State}
		*/
		function resourceEnd(code) {
			if (code === 41) {
				effects.enter("resourceMarker");
				effects.consume(code);
				effects.exit("resourceMarker");
				effects.exit("resource");
				return ok;
			}
			return nok(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeReferenceFull(effects, ok, nok) {
		const self = this;
		return referenceFull;
		/**
		* In a reference (full), at the `[`.
		*
		* ```markdown
		* > | [a][b] d
		*        ^
		* ```
		*
		* @type {State}
		*/
		function referenceFull(code) {
			return factoryLabel.call(self, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code);
		}
		/**
		* In a reference (full), after `]`.
		*
		* ```markdown
		* > | [a][b] d
		*          ^
		* ```
		*
		* @type {State}
		*/
		function referenceFullAfter(code) {
			return self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1))) ? ok(code) : nok(code);
		}
		/**
		* In reference (full) that was missing.
		*
		* ```markdown
		* > | [a][b d
		*        ^
		* ```
		*
		* @type {State}
		*/
		function referenceFullMissing(code) {
			return nok(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeReferenceCollapsed(effects, ok, nok) {
		return referenceCollapsedStart;
		/**
		* In reference (collapsed), at `[`.
		*
		* > 👉 **Note**: we only get here if the label is defined.
		*
		* ```markdown
		* > | [a][] d
		*        ^
		* ```
		*
		* @type {State}
		*/
		function referenceCollapsedStart(code) {
			effects.enter("reference");
			effects.enter("referenceMarker");
			effects.consume(code);
			effects.exit("referenceMarker");
			return referenceCollapsedOpen;
		}
		/**
		* In reference (collapsed), at `]`.
		*
		* > 👉 **Note**: we only get here if the label is defined.
		*
		* ```markdown
		* > | [a][] d
		*         ^
		* ```
		*
		*  @type {State}
		*/
		function referenceCollapsedOpen(code) {
			if (code === 93) {
				effects.enter("referenceMarker");
				effects.consume(code);
				effects.exit("referenceMarker");
				effects.exit("reference");
				return ok;
			}
			return nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/label-start-image.js
	/**
	* @import {
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var labelStartImage = {
		name: "labelStartImage",
		resolveAll: labelEnd.resolveAll,
		tokenize: tokenizeLabelStartImage
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeLabelStartImage(effects, ok, nok) {
		const self = this;
		return start;
		/**
		* Start of label (image) start.
		*
		* ```markdown
		* > | a ![b] c
		*       ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("labelImage");
			effects.enter("labelImageMarker");
			effects.consume(code);
			effects.exit("labelImageMarker");
			return open;
		}
		/**
		* After `!`, at `[`.
		*
		* ```markdown
		* > | a ![b] c
		*        ^
		* ```
		*
		* @type {State}
		*/
		function open(code) {
			if (code === 91) {
				effects.enter("labelMarker");
				effects.consume(code);
				effects.exit("labelMarker");
				effects.exit("labelImage");
				return after;
			}
			return nok(code);
		}
		/**
		* After `![`.
		*
		* ```markdown
		* > | a ![b] c
		*         ^
		* ```
		*
		* This is needed in because, when GFM footnotes are enabled, images never
		* form when started with a `^`.
		* Instead, links form:
		*
		* ```markdown
		* ![^a](b)
		*
		* ![^a][b]
		*
		* [b]: c
		* ```
		*
		* ```html
		* <p>!<a href=\"b\">^a</a></p>
		* <p>!<a href=\"c\">^a</a></p>
		* ```
		*
		* @type {State}
		*/
		function after(code) {
			/* c8 ignore next 3 */
			return code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code) : ok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/label-start-link.js
	/**
	* @import {
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var labelStartLink = {
		name: "labelStartLink",
		resolveAll: labelEnd.resolveAll,
		tokenize: tokenizeLabelStartLink
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeLabelStartLink(effects, ok, nok) {
		const self = this;
		return start;
		/**
		* Start of label (link) start.
		*
		* ```markdown
		* > | a [b] c
		*       ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("labelLink");
			effects.enter("labelMarker");
			effects.consume(code);
			effects.exit("labelMarker");
			effects.exit("labelLink");
			return after;
		}
		/** @type {State} */
		function after(code) {
			/* c8 ignore next 3 */
			return code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code) : ok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/line-ending.js
	/**
	* @import {
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var lineEnding = {
		name: "lineEnding",
		tokenize: tokenizeLineEnding
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeLineEnding(effects, ok) {
		return start;
		/** @type {State} */
		function start(code) {
			effects.enter("lineEnding");
			effects.consume(code);
			effects.exit("lineEnding");
			return factorySpace$1(effects, ok, "linePrefix");
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/thematic-break.js
	/**
	* @import {
	*   Code,
	*   Construct,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var thematicBreak$2 = {
		name: "thematicBreak",
		tokenize: tokenizeThematicBreak
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeThematicBreak(effects, ok, nok) {
		let size = 0;
		/** @type {NonNullable<Code>} */
		let marker;
		return start;
		/**
		* Start of thematic break.
		*
		* ```markdown
		* > | ***
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			effects.enter("thematicBreak");
			return before(code);
		}
		/**
		* After optional whitespace, at marker.
		*
		* ```markdown
		* > | ***
		*     ^
		* ```
		*
		* @type {State}
		*/
		function before(code) {
			marker = code;
			return atBreak(code);
		}
		/**
		* After something, before something else.
		*
		* ```markdown
		* > | ***
		*     ^
		* ```
		*
		* @type {State}
		*/
		function atBreak(code) {
			if (code === marker) {
				effects.enter("thematicBreakSequence");
				return sequence(code);
			}
			if (size >= 3 && (code === null || markdownLineEnding$1(code))) {
				effects.exit("thematicBreak");
				return ok(code);
			}
			return nok(code);
		}
		/**
		* In sequence.
		*
		* ```markdown
		* > | ***
		*     ^
		* ```
		*
		* @type {State}
		*/
		function sequence(code) {
			if (code === marker) {
				effects.consume(code);
				size++;
				return sequence;
			}
			effects.exit("thematicBreakSequence");
			return markdownSpace$1(code) ? factorySpace$1(effects, atBreak, "whitespace")(code) : atBreak(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/list.js
	/**
	* @import {
	*   Code,
	*   Construct,
	*   Exiter,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var list$3 = {
		continuation: { tokenize: tokenizeListContinuation },
		exit: tokenizeListEnd,
		name: "list",
		tokenize: tokenizeListStart
	};
	/** @type {Construct} */
	var listItemPrefixWhitespaceConstruct = {
		partial: true,
		tokenize: tokenizeListItemPrefixWhitespace
	};
	/** @type {Construct} */
	var indentConstruct = {
		partial: true,
		tokenize: tokenizeIndent
	};
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeListStart(effects, ok, nok) {
		const self = this;
		const tail = self.events[self.events.length - 1];
		let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
		let size = 0;
		return start;
		/** @type {State} */
		function start(code) {
			const kind = self.containerState.type || (code === 42 || code === 43 || code === 45 ? "listUnordered" : "listOrdered");
			if (kind === "listUnordered" ? !self.containerState.marker || code === self.containerState.marker : asciiDigit(code)) {
				if (!self.containerState.type) {
					self.containerState.type = kind;
					effects.enter(kind, { _container: true });
				}
				if (kind === "listUnordered") {
					effects.enter("listItemPrefix");
					return code === 42 || code === 45 ? effects.check(thematicBreak$2, nok, atMarker)(code) : atMarker(code);
				}
				if (!self.interrupt || code === 49) {
					effects.enter("listItemPrefix");
					effects.enter("listItemValue");
					return inside(code);
				}
			}
			return nok(code);
		}
		/** @type {State} */
		function inside(code) {
			if (asciiDigit(code) && ++size < 10) {
				effects.consume(code);
				return inside;
			}
			if ((!self.interrupt || size < 2) && (self.containerState.marker ? code === self.containerState.marker : code === 41 || code === 46)) {
				effects.exit("listItemValue");
				return atMarker(code);
			}
			return nok(code);
		}
		/**
		* @type {State}
		**/
		function atMarker(code) {
			effects.enter("listItemMarker");
			effects.consume(code);
			effects.exit("listItemMarker");
			self.containerState.marker = self.containerState.marker || code;
			return effects.check(blankLine, self.interrupt ? nok : onBlank, effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix));
		}
		/** @type {State} */
		function onBlank(code) {
			self.containerState.initialBlankLine = true;
			initialSize++;
			return endOfPrefix(code);
		}
		/** @type {State} */
		function otherPrefix(code) {
			if (markdownSpace$1(code)) {
				effects.enter("listItemPrefixWhitespace");
				effects.consume(code);
				effects.exit("listItemPrefixWhitespace");
				return endOfPrefix;
			}
			return nok(code);
		}
		/** @type {State} */
		function endOfPrefix(code) {
			self.containerState.size = initialSize + self.sliceSerialize(effects.exit("listItemPrefix"), true).length;
			return ok(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeListContinuation(effects, ok, nok) {
		const self = this;
		self.containerState._closeFlow = void 0;
		return effects.check(blankLine, onBlank, notBlank);
		/** @type {State} */
		function onBlank(code) {
			self.containerState.furtherBlankLines = self.containerState.furtherBlankLines || self.containerState.initialBlankLine;
			return factorySpace$1(effects, ok, "listItemIndent", self.containerState.size + 1)(code);
		}
		/** @type {State} */
		function notBlank(code) {
			if (self.containerState.furtherBlankLines || !markdownSpace$1(code)) {
				self.containerState.furtherBlankLines = void 0;
				self.containerState.initialBlankLine = void 0;
				return notInCurrentItem(code);
			}
			self.containerState.furtherBlankLines = void 0;
			self.containerState.initialBlankLine = void 0;
			return effects.attempt(indentConstruct, ok, notInCurrentItem)(code);
		}
		/** @type {State} */
		function notInCurrentItem(code) {
			self.containerState._closeFlow = true;
			self.interrupt = void 0;
			return factorySpace$1(effects, effects.attempt(list$3, ok, nok), "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeIndent(effects, ok, nok) {
		const self = this;
		return factorySpace$1(effects, afterPrefix, "listItemIndent", self.containerState.size + 1);
		/** @type {State} */
		function afterPrefix(code) {
			const tail = self.events[self.events.length - 1];
			return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self.containerState.size ? ok(code) : nok(code);
		}
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Exiter}
	*/
	function tokenizeListEnd(effects) {
		effects.exit(this.containerState.type);
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeListItemPrefixWhitespace(effects, ok, nok) {
		const self = this;
		return factorySpace$1(effects, afterPrefix, "listItemPrefixWhitespace", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
		/** @type {State} */
		function afterPrefix(code) {
			const tail = self.events[self.events.length - 1];
			return !markdownSpace$1(code) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok(code) : nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark-core-commonmark/lib/setext-underline.js
	/**
	* @import {
	*   Code,
	*   Construct,
	*   Resolver,
	*   State,
	*   TokenizeContext,
	*   Tokenizer
	* } from 'micromark-util-types'
	*/
	/** @type {Construct} */
	var setextUnderline = {
		name: "setextUnderline",
		resolveTo: resolveToSetextUnderline,
		tokenize: tokenizeSetextUnderline
	};
	/** @type {Resolver} */
	function resolveToSetextUnderline(events, context) {
		let index = events.length;
		/** @type {number | undefined} */
		let content;
		/** @type {number | undefined} */
		let text;
		/** @type {number | undefined} */
		let definition;
		while (index--) if (events[index][0] === "enter") {
			if (events[index][1].type === "content") {
				content = index;
				break;
			}
			if (events[index][1].type === "paragraph") text = index;
		} else {
			if (events[index][1].type === "content") events.splice(index, 1);
			if (!definition && events[index][1].type === "definition") definition = index;
		}
		const heading = {
			type: "setextHeading",
			start: { ...events[content][1].start },
			end: { ...events[events.length - 1][1].end }
		};
		events[text][1].type = "setextHeadingText";
		if (definition) {
			events.splice(text, 0, [
				"enter",
				heading,
				context
			]);
			events.splice(definition + 1, 0, [
				"exit",
				events[content][1],
				context
			]);
			events[content][1].end = { ...events[definition][1].end };
		} else events[content][1] = heading;
		events.push([
			"exit",
			heading,
			context
		]);
		return events;
	}
	/**
	* @this {TokenizeContext}
	*   Context.
	* @type {Tokenizer}
	*/
	function tokenizeSetextUnderline(effects, ok, nok) {
		const self = this;
		/** @type {NonNullable<Code>} */
		let marker;
		return start;
		/**
		* At start of heading (setext) underline.
		*
		* ```markdown
		*   | aa
		* > | ==
		*     ^
		* ```
		*
		* @type {State}
		*/
		function start(code) {
			let index = self.events.length;
			/** @type {boolean | undefined} */
			let paragraph;
			while (index--) if (self.events[index][1].type !== "lineEnding" && self.events[index][1].type !== "linePrefix" && self.events[index][1].type !== "content") {
				paragraph = self.events[index][1].type === "paragraph";
				break;
			}
			if (!self.parser.lazy[self.now().line] && (self.interrupt || paragraph)) {
				effects.enter("setextHeadingLine");
				marker = code;
				return before(code);
			}
			return nok(code);
		}
		/**
		* After optional whitespace, at `-` or `=`.
		*
		* ```markdown
		*   | aa
		* > | ==
		*     ^
		* ```
		*
		* @type {State}
		*/
		function before(code) {
			effects.enter("setextHeadingLineSequence");
			return inside(code);
		}
		/**
		* In sequence.
		*
		* ```markdown
		*   | aa
		* > | ==
		*     ^
		* ```
		*
		* @type {State}
		*/
		function inside(code) {
			if (code === marker) {
				effects.consume(code);
				return inside;
			}
			effects.exit("setextHeadingLineSequence");
			return markdownSpace$1(code) ? factorySpace$1(effects, after, "lineSuffix")(code) : after(code);
		}
		/**
		* After sequence, after optional whitespace.
		*
		* ```markdown
		*   | aa
		* > | ==
		*       ^
		* ```
		*
		* @type {State}
		*/
		function after(code) {
			if (code === null || markdownLineEnding$1(code)) {
				effects.exit("setextHeadingLine");
				return ok(code);
			}
			return nok(code);
		}
	}
	//#endregion
	//#region node_modules/micromark/lib/initialize/flow.js
	/**
	* @import {
	*   InitialConstruct,
	*   Initializer,
	*   State,
	*   TokenizeContext
	* } from 'micromark-util-types'
	*/
	/** @type {InitialConstruct} */
	var flow$1 = { tokenize: initializeFlow };
	/**
	* @this {TokenizeContext}
	*   Self.
	* @type {Initializer}
	*   Initializer.
	*/
	function initializeFlow(effects) {
		const self = this;
		const initial = effects.attempt(blankLine, atBlankEnding, effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace$1(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content, afterConstruct)), "linePrefix")));
		return initial;
		/** @type {State} */
		function atBlankEnding(code) {
			if (code === null) {
				effects.consume(code);
				return;
			}
			effects.enter("lineEndingBlank");
			effects.consume(code);
			effects.exit("lineEndingBlank");
			self.currentConstruct = void 0;
			return initial;
		}
		/** @type {State} */
		function afterConstruct(code) {
			if (code === null) {
				effects.consume(code);
				return;
			}
			effects.enter("lineEnding");
			effects.consume(code);
			effects.exit("lineEnding");
			self.currentConstruct = void 0;
			return initial;
		}
	}
	//#endregion
	//#region node_modules/micromark/lib/initialize/text.js
	/**
	* @import {
	*   Code,
	*   InitialConstruct,
	*   Initializer,
	*   Resolver,
	*   State,
	*   TokenizeContext
	* } from 'micromark-util-types'
	*/
	var resolver = { resolveAll: createResolver() };
	var string$1 = initializeFactory("string");
	var text$4 = initializeFactory("text");
	/**
	* @param {'string' | 'text'} field
	*   Field.
	* @returns {InitialConstruct}
	*   Construct.
	*/
	function initializeFactory(field) {
		return {
			resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
			tokenize: initializeText
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Initializer}
		*/
		function initializeText(effects) {
			const self = this;
			const constructs = this.parser.constructs[field];
			const text = effects.attempt(constructs, start, notText);
			return start;
			/** @type {State} */
			function start(code) {
				return atBreak(code) ? text(code) : notText(code);
			}
			/** @type {State} */
			function notText(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("data");
				effects.consume(code);
				return data;
			}
			/** @type {State} */
			function data(code) {
				if (atBreak(code)) {
					effects.exit("data");
					return text(code);
				}
				effects.consume(code);
				return data;
			}
			/**
			* @param {Code} code
			*   Code.
			* @returns {boolean}
			*   Whether the code is a break.
			*/
			function atBreak(code) {
				if (code === null) return true;
				const list = constructs[code];
				let index = -1;
				if (list) while (++index < list.length) {
					const item = list[index];
					if (!item.previous || item.previous.call(self, self.previous)) return true;
				}
				return false;
			}
		}
	}
	/**
	* @param {Resolver | undefined} [extraResolver]
	*   Resolver.
	* @returns {Resolver}
	*   Resolver.
	*/
	function createResolver(extraResolver) {
		return resolveAllText;
		/** @type {Resolver} */
		function resolveAllText(events, context) {
			let index = -1;
			/** @type {number | undefined} */
			let enter;
			while (++index <= events.length) if (enter === void 0) {
				if (events[index] && events[index][1].type === "data") {
					enter = index;
					index++;
				}
			} else if (!events[index] || events[index][1].type !== "data") {
				if (index !== enter + 2) {
					events[enter][1].end = events[index - 1][1].end;
					events.splice(enter + 2, index - enter - 2);
					index = enter + 2;
				}
				enter = void 0;
			}
			return extraResolver ? extraResolver(events, context) : events;
		}
	}
	/**
	* A rather ugly set of instructions which again looks at chunks in the input
	* stream.
	* The reason to do this here is that it is *much* faster to parse in reverse.
	* And that we can’t hook into `null` to split the line suffix before an EOF.
	* To do: figure out if we can make this into a clean utility, or even in core.
	* As it will be useful for GFMs literal autolink extension (and maybe even
	* tables?)
	*
	* @type {Resolver}
	*/
	function resolveAllLineSuffixes(events, context) {
		let eventIndex = 0;
		while (++eventIndex <= events.length) if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
			const data = events[eventIndex - 1][1];
			const chunks = context.sliceStream(data);
			let index = chunks.length;
			let bufferIndex = -1;
			let size = 0;
			/** @type {boolean | undefined} */
			let tabs;
			while (index--) {
				const chunk = chunks[index];
				if (typeof chunk === "string") {
					bufferIndex = chunk.length;
					while (chunk.charCodeAt(bufferIndex - 1) === 32) {
						size++;
						bufferIndex--;
					}
					if (bufferIndex) break;
					bufferIndex = -1;
				} else if (chunk === -2) {
					tabs = true;
					size++;
				} else if (chunk === -1) {} else {
					index++;
					break;
				}
			}
			if (context._contentTypeTextTrailing && eventIndex === events.length) size = 0;
			if (size) {
				const token = {
					type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
					start: {
						_bufferIndex: index ? bufferIndex : data.start._bufferIndex + bufferIndex,
						_index: data.start._index + index,
						line: data.end.line,
						column: data.end.column - size,
						offset: data.end.offset - size
					},
					end: { ...data.end }
				};
				data.end = { ...token.start };
				if (data.start.offset === data.end.offset) Object.assign(data, token);
				else {
					events.splice(eventIndex, 0, [
						"enter",
						token,
						context
					], [
						"exit",
						token,
						context
					]);
					eventIndex += 2;
				}
			}
			eventIndex++;
		}
		return events;
	}
	//#endregion
	//#region node_modules/micromark/lib/constructs.js
	/**
	* @import {Extension} from 'micromark-util-types'
	*/
	var constructs_exports = /* @__PURE__ */ __exportAll({
		attentionMarkers: () => attentionMarkers,
		contentInitial: () => contentInitial,
		disable: () => disable,
		document: () => document$1,
		flow: () => flow,
		flowInitial: () => flowInitial,
		insideSpan: () => insideSpan,
		string: () => string,
		text: () => text$3
	});
	/** @satisfies {Extension['document']} */
	var document$1 = {
		[42]: list$3,
		[43]: list$3,
		[45]: list$3,
		[48]: list$3,
		[49]: list$3,
		[50]: list$3,
		[51]: list$3,
		[52]: list$3,
		[53]: list$3,
		[54]: list$3,
		[55]: list$3,
		[56]: list$3,
		[57]: list$3,
		[62]: blockQuote
	};
	/** @satisfies {Extension['contentInitial']} */
	var contentInitial = { [91]: definition$2 };
	/** @satisfies {Extension['flowInitial']} */
	var flowInitial = {
		[-2]: codeIndented,
		[-1]: codeIndented,
		[32]: codeIndented
	};
	/** @satisfies {Extension['flow']} */
	var flow = {
		[35]: headingAtx,
		[42]: thematicBreak$2,
		[45]: [setextUnderline, thematicBreak$2],
		[60]: htmlFlow,
		[61]: setextUnderline,
		[95]: thematicBreak$2,
		[96]: codeFenced,
		[126]: codeFenced
	};
	/** @satisfies {Extension['string']} */
	var string = {
		[38]: characterReference,
		[92]: characterEscape
	};
	/** @satisfies {Extension['text']} */
	var text$3 = {
		[-5]: lineEnding,
		[-4]: lineEnding,
		[-3]: lineEnding,
		[33]: labelStartImage,
		[38]: characterReference,
		[42]: attention,
		[60]: [autolink, htmlText],
		[91]: labelStartLink,
		[92]: [hardBreakEscape, characterEscape],
		[93]: labelEnd,
		[95]: attention,
		[96]: codeText
	};
	/** @satisfies {Extension['insideSpan']} */
	var insideSpan = { null: [attention, resolver] };
	/** @satisfies {Extension['attentionMarkers']} */
	var attentionMarkers = { null: [42, 95] };
	/** @satisfies {Extension['disable']} */
	var disable = { null: [] };
	//#endregion
	//#region node_modules/micromark/lib/create-tokenizer.js
	/**
	* @import {
	*   Chunk,
	*   Code,
	*   ConstructRecord,
	*   Construct,
	*   Effects,
	*   InitialConstruct,
	*   ParseContext,
	*   Point,
	*   State,
	*   TokenizeContext,
	*   Token
	* } from 'micromark-util-types'
	*/
	/**
	* @callback Restore
	*   Restore the state.
	* @returns {undefined}
	*   Nothing.
	*
	* @typedef Info
	*   Info.
	* @property {Restore} restore
	*   Restore.
	* @property {number} from
	*   From.
	*
	* @callback ReturnHandle
	*   Handle a successful run.
	* @param {Construct} construct
	*   Construct.
	* @param {Info} info
	*   Info.
	* @returns {undefined}
	*   Nothing.
	*/
	/**
	* Create a tokenizer.
	* Tokenizers deal with one type of data (e.g., containers, flow, text).
	* The parser is the object dealing with it all.
	* `initialize` works like other constructs, except that only its `tokenize`
	* function is used, in which case it doesn’t receive an `ok` or `nok`.
	* `from` can be given to set the point before the first character, although
	* when further lines are indented, they must be set with `defineSkip`.
	*
	* @param {ParseContext} parser
	*   Parser.
	* @param {InitialConstruct} initialize
	*   Construct.
	* @param {Omit<Point, '_bufferIndex' | '_index'> | undefined} [from]
	*   Point (optional).
	* @returns {TokenizeContext}
	*   Context.
	*/
	function createTokenizer(parser, initialize, from) {
		/** @type {Point} */
		let point = {
			_bufferIndex: -1,
			_index: 0,
			line: from && from.line || 1,
			column: from && from.column || 1,
			offset: from && from.offset || 0
		};
		/** @type {Record<string, number>} */
		const columnStart = {};
		/** @type {Array<Construct>} */
		const resolveAllConstructs = [];
		/** @type {Array<Chunk>} */
		let chunks = [];
		/** @type {Array<Token>} */
		let stack = [];
		/**
		* Tools used for tokenizing.
		*
		* @type {Effects}
		*/
		const effects = {
			attempt: constructFactory(onsuccessfulconstruct),
			check: constructFactory(onsuccessfulcheck),
			consume,
			enter,
			exit,
			interrupt: constructFactory(onsuccessfulcheck, { interrupt: true })
		};
		/**
		* State and tools for resolving and serializing.
		*
		* @type {TokenizeContext}
		*/
		const context = {
			code: null,
			containerState: {},
			defineSkip,
			events: [],
			now,
			parser,
			previous: null,
			sliceSerialize,
			sliceStream,
			write
		};
		/**
		* The state function.
		*
		* @type {State | undefined}
		*/
		let state = initialize.tokenize.call(context, effects);
		if (initialize.resolveAll) resolveAllConstructs.push(initialize);
		return context;
		/** @type {TokenizeContext['write']} */
		function write(slice) {
			chunks = push(chunks, slice);
			main();
			if (chunks[chunks.length - 1] !== null) return [];
			addResult(initialize, 0);
			context.events = resolveAll$1(resolveAllConstructs, context.events, context);
			return context.events;
		}
		/** @type {TokenizeContext['sliceSerialize']} */
		function sliceSerialize(token, expandTabs) {
			return serializeChunks(sliceStream(token), expandTabs);
		}
		/** @type {TokenizeContext['sliceStream']} */
		function sliceStream(token) {
			return sliceChunks(chunks, token);
		}
		/** @type {TokenizeContext['now']} */
		function now() {
			const { _bufferIndex, _index, line, column, offset } = point;
			return {
				_bufferIndex,
				_index,
				line,
				column,
				offset
			};
		}
		/** @type {TokenizeContext['defineSkip']} */
		function defineSkip(value) {
			columnStart[value.line] = value.column;
			accountForPotentialSkip();
		}
		/**
		* Main loop (note that `_index` and `_bufferIndex` in `point` are modified by
		* `consume`).
		* Here is where we walk through the chunks, which either include strings of
		* several characters, or numerical character codes.
		* The reason to do this in a loop instead of a call is so the stack can
		* drain.
		*
		* @returns {undefined}
		*   Nothing.
		*/
		function main() {
			/** @type {number} */
			let chunkIndex;
			while (point._index < chunks.length) {
				const chunk = chunks[point._index];
				if (typeof chunk === "string") {
					chunkIndex = point._index;
					if (point._bufferIndex < 0) point._bufferIndex = 0;
					while (point._index === chunkIndex && point._bufferIndex < chunk.length) go(chunk.charCodeAt(point._bufferIndex));
				} else go(chunk);
			}
		}
		/**
		* Deal with one code.
		*
		* @param {Code} code
		*   Code.
		* @returns {undefined}
		*   Nothing.
		*/
		function go(code) {
			state = state(code);
		}
		/** @type {Effects['consume']} */
		function consume(code) {
			if (markdownLineEnding$1(code)) {
				point.line++;
				point.column = 1;
				point.offset += code === -3 ? 2 : 1;
				accountForPotentialSkip();
			} else if (code !== -1) {
				point.column++;
				point.offset++;
			}
			if (point._bufferIndex < 0) point._index++;
			else {
				point._bufferIndex++;
				if (point._bufferIndex === chunks[point._index].length) {
					point._bufferIndex = -1;
					point._index++;
				}
			}
			context.previous = code;
		}
		/** @type {Effects['enter']} */
		function enter(type, fields) {
			/** @type {Token} */
			const token = fields || {};
			token.type = type;
			token.start = now();
			context.events.push([
				"enter",
				token,
				context
			]);
			stack.push(token);
			return token;
		}
		/** @type {Effects['exit']} */
		function exit(type) {
			const token = stack.pop();
			token.end = now();
			context.events.push([
				"exit",
				token,
				context
			]);
			return token;
		}
		/**
		* Use results.
		*
		* @type {ReturnHandle}
		*/
		function onsuccessfulconstruct(construct, info) {
			addResult(construct, info.from);
		}
		/**
		* Discard results.
		*
		* @type {ReturnHandle}
		*/
		function onsuccessfulcheck(_, info) {
			info.restore();
		}
		/**
		* Factory to attempt/check/interrupt.
		*
		* @param {ReturnHandle} onreturn
		*   Callback.
		* @param {{interrupt?: boolean | undefined} | undefined} [fields]
		*   Fields.
		*/
		function constructFactory(onreturn, fields) {
			return hook;
			/**
			* Handle either an object mapping codes to constructs, a list of
			* constructs, or a single construct.
			*
			* @param {Array<Construct> | ConstructRecord | Construct} constructs
			*   Constructs.
			* @param {State} returnState
			*   State.
			* @param {State | undefined} [bogusState]
			*   State.
			* @returns {State}
			*   State.
			*/
			function hook(constructs, returnState, bogusState) {
				/** @type {ReadonlyArray<Construct>} */
				let listOfConstructs;
				/** @type {number} */
				let constructIndex;
				/** @type {Construct} */
				let currentConstruct;
				/** @type {Info} */
				let info;
				return Array.isArray(constructs) ? handleListOfConstructs(constructs) : "tokenize" in constructs ? handleListOfConstructs([constructs]) : handleMapOfConstructs(constructs);
				/**
				* Handle a list of construct.
				*
				* @param {ConstructRecord} map
				*   Constructs.
				* @returns {State}
				*   State.
				*/
				function handleMapOfConstructs(map) {
					return start;
					/** @type {State} */
					function start(code) {
						const left = code !== null && map[code];
						const all = code !== null && map.null;
						return handleListOfConstructs([...Array.isArray(left) ? left : left ? [left] : [], ...Array.isArray(all) ? all : all ? [all] : []])(code);
					}
				}
				/**
				* Handle a list of construct.
				*
				* @param {ReadonlyArray<Construct>} list
				*   Constructs.
				* @returns {State}
				*   State.
				*/
				function handleListOfConstructs(list) {
					listOfConstructs = list;
					constructIndex = 0;
					if (list.length === 0) return bogusState;
					return handleConstruct(list[constructIndex]);
				}
				/**
				* Handle a single construct.
				*
				* @param {Construct} construct
				*   Construct.
				* @returns {State}
				*   State.
				*/
				function handleConstruct(construct) {
					return start;
					/** @type {State} */
					function start(code) {
						info = store();
						currentConstruct = construct;
						if (!construct.partial) context.currentConstruct = construct;
						if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) return nok(code);
						return construct.tokenize.call(fields ? Object.assign(Object.create(context), fields) : context, effects, ok, nok)(code);
					}
				}
				/** @type {State} */
				function ok(code) {
					onreturn(currentConstruct, info);
					return returnState;
				}
				/** @type {State} */
				function nok(code) {
					info.restore();
					if (++constructIndex < listOfConstructs.length) return handleConstruct(listOfConstructs[constructIndex]);
					return bogusState;
				}
			}
		}
		/**
		* @param {Construct} construct
		*   Construct.
		* @param {number} from
		*   From.
		* @returns {undefined}
		*   Nothing.
		*/
		function addResult(construct, from) {
			if (construct.resolveAll && !resolveAllConstructs.includes(construct)) resolveAllConstructs.push(construct);
			if (construct.resolve) splice$1(context.events, from, context.events.length - from, construct.resolve(context.events.slice(from), context));
			if (construct.resolveTo) context.events = construct.resolveTo(context.events, context);
		}
		/**
		* Store state.
		*
		* @returns {Info}
		*   Info.
		*/
		function store() {
			const startPoint = now();
			const startPrevious = context.previous;
			const startCurrentConstruct = context.currentConstruct;
			const startEventsIndex = context.events.length;
			const startStack = Array.from(stack);
			return {
				from: startEventsIndex,
				restore
			};
			/**
			* Restore state.
			*
			* @returns {undefined}
			*   Nothing.
			*/
			function restore() {
				point = startPoint;
				context.previous = startPrevious;
				context.currentConstruct = startCurrentConstruct;
				context.events.length = startEventsIndex;
				stack = startStack;
				accountForPotentialSkip();
			}
		}
		/**
		* Move the current point a bit forward in the line when it’s on a column
		* skip.
		*
		* @returns {undefined}
		*   Nothing.
		*/
		function accountForPotentialSkip() {
			if (point.line in columnStart && point.column < 2) {
				point.column = columnStart[point.line];
				point.offset += columnStart[point.line] - 1;
			}
		}
	}
	/**
	* Get the chunks from a slice of chunks in the range of a token.
	*
	* @param {ReadonlyArray<Chunk>} chunks
	*   Chunks.
	* @param {Pick<Token, 'end' | 'start'>} token
	*   Token.
	* @returns {Array<Chunk>}
	*   Chunks.
	*/
	function sliceChunks(chunks, token) {
		const startIndex = token.start._index;
		const startBufferIndex = token.start._bufferIndex;
		const endIndex = token.end._index;
		const endBufferIndex = token.end._bufferIndex;
		/** @type {Array<Chunk>} */
		let view;
		if (startIndex === endIndex) view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
		else {
			view = chunks.slice(startIndex, endIndex);
			if (startBufferIndex > -1) {
				const head = view[0];
				if (typeof head === "string") view[0] = head.slice(startBufferIndex);
				else view.shift();
			}
			if (endBufferIndex > 0) view.push(chunks[endIndex].slice(0, endBufferIndex));
		}
		return view;
	}
	/**
	* Get the string value of a slice of chunks.
	*
	* @param {ReadonlyArray<Chunk>} chunks
	*   Chunks.
	* @param {boolean | undefined} [expandTabs=false]
	*   Whether to expand tabs (default: `false`).
	* @returns {string}
	*   Result.
	*/
	function serializeChunks(chunks, expandTabs) {
		let index = -1;
		/** @type {Array<string>} */
		const result = [];
		/** @type {boolean | undefined} */
		let atTab;
		while (++index < chunks.length) {
			const chunk = chunks[index];
			/** @type {string} */
			let value;
			if (typeof chunk === "string") value = chunk;
			else switch (chunk) {
				case -5:
					value = "\r";
					break;
				case -4:
					value = "\n";
					break;
				case -3:
					value = "\r\n";
					break;
				case -2:
					value = expandTabs ? " " : "	";
					break;
				case -1:
					if (!expandTabs && atTab) continue;
					value = " ";
					break;
				default: value = String.fromCharCode(chunk);
			}
			atTab = chunk === -2;
			result.push(value);
		}
		return result.join("");
	}
	//#endregion
	//#region node_modules/micromark/lib/parse.js
	/**
	* @import {
	*   Create,
	*   FullNormalizedExtension,
	*   InitialConstruct,
	*   ParseContext,
	*   ParseOptions
	* } from 'micromark-util-types'
	*/
	/**
	* @param {ParseOptions | null | undefined} [options]
	*   Configuration (optional).
	* @returns {ParseContext}
	*   Parser.
	*/
	function parse(options) {
		/** @type {ParseContext} */
		const parser = {
			constructs: combineExtensions([constructs_exports, ...(options || {}).extensions || []]),
			content: create(content$1),
			defined: [],
			document: create(document$2),
			flow: create(flow$1),
			lazy: {},
			string: create(string$1),
			text: create(text$4)
		};
		return parser;
		/**
		* @param {InitialConstruct} initial
		*   Construct to start with.
		* @returns {Create}
		*   Create a tokenizer.
		*/
		function create(initial) {
			return creator;
			/** @type {Create} */
			function creator(from) {
				return createTokenizer(parser, initial, from);
			}
		}
	}
	//#endregion
	//#region node_modules/micromark/lib/postprocess.js
	/**
	* @import {Event} from 'micromark-util-types'
	*/
	/**
	* @param {Array<Event>} events
	*   Events.
	* @returns {Array<Event>}
	*   Events.
	*/
	function postprocess(events) {
		while (!subtokenize(events));
		return events;
	}
	//#endregion
	//#region node_modules/micromark/lib/preprocess.js
	/**
	* @import {Chunk, Code, Encoding, Value} from 'micromark-util-types'
	*/
	/**
	* @callback Preprocessor
	*   Preprocess a value.
	* @param {Value} value
	*   Value.
	* @param {Encoding | null | undefined} [encoding]
	*   Encoding when `value` is a typed array (optional).
	* @param {boolean | null | undefined} [end=false]
	*   Whether this is the last chunk (default: `false`).
	* @returns {Array<Chunk>}
	*   Chunks.
	*/
	var search = /[\0\t\n\r]/g;
	/**
	* @returns {Preprocessor}
	*   Preprocess a value.
	*/
	function preprocess() {
		let column = 1;
		let buffer = "";
		/** @type {boolean | undefined} */
		let start = true;
		/** @type {boolean | undefined} */
		let atCarriageReturn;
		return preprocessor;
		/** @type {Preprocessor} */
		function preprocessor(value, encoding, end) {
			/** @type {Array<Chunk>} */
			const chunks = [];
			/** @type {RegExpMatchArray | null} */
			let match;
			/** @type {number} */
			let next;
			/** @type {number} */
			let startPosition;
			/** @type {number} */
			let endPosition;
			/** @type {Code} */
			let code;
			value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
			startPosition = 0;
			buffer = "";
			if (start) {
				if (value.charCodeAt(0) === 65279) startPosition++;
				start = void 0;
			}
			while (startPosition < value.length) {
				search.lastIndex = startPosition;
				match = search.exec(value);
				endPosition = match && match.index !== void 0 ? match.index : value.length;
				code = value.charCodeAt(endPosition);
				if (!match) {
					buffer = value.slice(startPosition);
					break;
				}
				if (code === 10 && startPosition === endPosition && atCarriageReturn) {
					chunks.push(-3);
					atCarriageReturn = void 0;
				} else {
					if (atCarriageReturn) {
						chunks.push(-5);
						atCarriageReturn = void 0;
					}
					if (startPosition < endPosition) {
						chunks.push(value.slice(startPosition, endPosition));
						column += endPosition - startPosition;
					}
					switch (code) {
						case 0:
							chunks.push(65533);
							column++;
							break;
						case 9:
							next = Math.ceil(column / 4) * 4;
							chunks.push(-2);
							while (column++ < next) chunks.push(-1);
							break;
						case 10:
							chunks.push(-4);
							column = 1;
							break;
						default:
							atCarriageReturn = true;
							column = 1;
					}
				}
				startPosition = endPosition + 1;
			}
			if (end) {
				if (atCarriageReturn) chunks.push(-5);
				if (buffer) chunks.push(buffer);
				chunks.push(null);
			}
			return chunks;
		}
	}
	//#endregion
	//#region node_modules/micromark-util-decode-string/index.js
	var characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
	/**
	* Decode markdown strings (which occur in places such as fenced code info
	* strings, destinations, labels, and titles).
	*
	* The “string” content type allows character escapes and -references.
	* This decodes those.
	*
	* @param {string} value
	*   Value to decode.
	* @returns {string}
	*   Decoded value.
	*/
	function decodeString(value) {
		return value.replace(characterEscapeOrReference, decode);
	}
	/**
	* @param {string} $0
	*   Match.
	* @param {string} $1
	*   Character escape.
	* @param {string} $2
	*   Character reference.
	* @returns {string}
	*   Decoded value
	*/
	function decode($0, $1, $2) {
		if ($1) return $1;
		if ($2.charCodeAt(0) === 35) {
			const head = $2.charCodeAt(1);
			const hex = head === 120 || head === 88;
			return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10);
		}
		return decodeNamedCharacterReference($2) || $0;
	}
	//#endregion
	//#region node_modules/mdast-util-from-markdown/lib/index.js
	/**
	* @import {
	*   Break,
	*   Blockquote,
	*   Code,
	*   Definition,
	*   Emphasis,
	*   Heading,
	*   Html,
	*   Image,
	*   InlineCode,
	*   Link,
	*   ListItem,
	*   List,
	*   Nodes,
	*   Paragraph,
	*   PhrasingContent,
	*   ReferenceType,
	*   Root,
	*   Strong,
	*   Text,
	*   ThematicBreak
	* } from 'mdast'
	* @import {
	*   Encoding,
	*   Event,
	*   Token,
	*   Value
	* } from 'micromark-util-types'
	* @import {Point} from 'unist'
	* @import {
	*   CompileContext,
	*   CompileData,
	*   Config,
	*   Extension,
	*   Handle,
	*   OnEnterError,
	*   Options
	* } from './types.js'
	*/
	var own$2 = {}.hasOwnProperty;
	/**
	* Turn markdown into a syntax tree.
	*
	* @overload
	* @param {Value} value
	* @param {Encoding | null | undefined} [encoding]
	* @param {Options | null | undefined} [options]
	* @returns {Root}
	*
	* @overload
	* @param {Value} value
	* @param {Options | null | undefined} [options]
	* @returns {Root}
	*
	* @param {Value} value
	*   Markdown to parse.
	* @param {Encoding | Options | null | undefined} [encoding]
	*   Character encoding for when `value` is `Buffer`.
	* @param {Options | null | undefined} [options]
	*   Configuration.
	* @returns {Root}
	*   mdast tree.
	*/
	function fromMarkdown(value, encoding, options) {
		if (encoding && typeof encoding === "object") {
			options = encoding;
			encoding = void 0;
		}
		return compiler(options)(postprocess(parse(options).document().write(preprocess()(value, encoding, true))));
	}
	/**
	* Note this compiler only understand complete buffering, not streaming.
	*
	* @param {Options | null | undefined} [options]
	*/
	function compiler(options) {
		/** @type {Config} */
		const config = {
			transforms: [],
			canContainEols: [
				"emphasis",
				"fragment",
				"heading",
				"paragraph",
				"strong"
			],
			enter: {
				autolink: opener(link),
				autolinkProtocol: onenterdata,
				autolinkEmail: onenterdata,
				atxHeading: opener(heading),
				blockQuote: opener(blockQuote),
				characterEscape: onenterdata,
				characterReference: onenterdata,
				codeFenced: opener(codeFlow),
				codeFencedFenceInfo: buffer,
				codeFencedFenceMeta: buffer,
				codeIndented: opener(codeFlow, buffer),
				codeText: opener(codeText, buffer),
				codeTextData: onenterdata,
				data: onenterdata,
				codeFlowValue: onenterdata,
				definition: opener(definition),
				definitionDestinationString: buffer,
				definitionLabelString: buffer,
				definitionTitleString: buffer,
				emphasis: opener(emphasis),
				hardBreakEscape: opener(hardBreak),
				hardBreakTrailing: opener(hardBreak),
				htmlFlow: opener(html, buffer),
				htmlFlowData: onenterdata,
				htmlText: opener(html, buffer),
				htmlTextData: onenterdata,
				image: opener(image),
				label: buffer,
				link: opener(link),
				listItem: opener(listItem),
				listItemValue: onenterlistitemvalue,
				listOrdered: opener(list, onenterlistordered),
				listUnordered: opener(list),
				paragraph: opener(paragraph),
				reference: onenterreference,
				referenceString: buffer,
				resourceDestinationString: buffer,
				resourceTitleString: buffer,
				setextHeading: opener(heading),
				strong: opener(strong),
				thematicBreak: opener(thematicBreak)
			},
			exit: {
				atxHeading: closer(),
				atxHeadingSequence: onexitatxheadingsequence,
				autolink: closer(),
				autolinkEmail: onexitautolinkemail,
				autolinkProtocol: onexitautolinkprotocol,
				blockQuote: closer(),
				characterEscapeValue: onexitdata,
				characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
				characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
				characterReferenceValue: onexitcharacterreferencevalue,
				characterReference: onexitcharacterreference,
				codeFenced: closer(onexitcodefenced),
				codeFencedFence: onexitcodefencedfence,
				codeFencedFenceInfo: onexitcodefencedfenceinfo,
				codeFencedFenceMeta: onexitcodefencedfencemeta,
				codeFlowValue: onexitdata,
				codeIndented: closer(onexitcodeindented),
				codeText: closer(onexitcodetext),
				codeTextData: onexitdata,
				data: onexitdata,
				definition: closer(),
				definitionDestinationString: onexitdefinitiondestinationstring,
				definitionLabelString: onexitdefinitionlabelstring,
				definitionTitleString: onexitdefinitiontitlestring,
				emphasis: closer(),
				hardBreakEscape: closer(onexithardbreak),
				hardBreakTrailing: closer(onexithardbreak),
				htmlFlow: closer(onexithtmlflow),
				htmlFlowData: onexitdata,
				htmlText: closer(onexithtmltext),
				htmlTextData: onexitdata,
				image: closer(onexitimage),
				label: onexitlabel,
				labelText: onexitlabeltext,
				lineEnding: onexitlineending,
				link: closer(onexitlink),
				listItem: closer(),
				listOrdered: closer(),
				listUnordered: closer(),
				paragraph: closer(),
				referenceString: onexitreferencestring,
				resourceDestinationString: onexitresourcedestinationstring,
				resourceTitleString: onexitresourcetitlestring,
				resource: onexitresource,
				setextHeading: closer(onexitsetextheading),
				setextHeadingLineSequence: onexitsetextheadinglinesequence,
				setextHeadingText: onexitsetextheadingtext,
				strong: closer(),
				thematicBreak: closer()
			}
		};
		configure$1(config, (options || {}).mdastExtensions || []);
		/** @type {CompileData} */
		const data = {};
		return compile;
		/**
		* Turn micromark events into an mdast tree.
		*
		* @param {Array<Event>} events
		*   Events.
		* @returns {Root}
		*   mdast tree.
		*/
		function compile(events) {
			/** @type {Root} */
			let tree = {
				type: "root",
				children: []
			};
			/** @type {Omit<CompileContext, 'sliceSerialize'>} */
			const context = {
				stack: [tree],
				tokenStack: [],
				config,
				enter,
				exit,
				buffer,
				resume,
				data
			};
			/** @type {Array<number>} */
			const listStack = [];
			let index = -1;
			while (++index < events.length) if (events[index][1].type === "listOrdered" || events[index][1].type === "listUnordered") if (events[index][0] === "enter") listStack.push(index);
			else index = prepareList(events, listStack.pop(), index);
			index = -1;
			while (++index < events.length) {
				const handler = config[events[index][0]];
				if (own$2.call(handler, events[index][1].type)) handler[events[index][1].type].call(Object.assign({ sliceSerialize: events[index][2].sliceSerialize }, context), events[index][1]);
			}
			if (context.tokenStack.length > 0) {
				const tail = context.tokenStack[context.tokenStack.length - 1];
				(tail[1] || defaultOnError).call(context, void 0, tail[0]);
			}
			tree.position = {
				start: point(events.length > 0 ? events[0][1].start : {
					line: 1,
					column: 1,
					offset: 0
				}),
				end: point(events.length > 0 ? events[events.length - 2][1].end : {
					line: 1,
					column: 1,
					offset: 0
				})
			};
			index = -1;
			while (++index < config.transforms.length) tree = config.transforms[index](tree) || tree;
			return tree;
		}
		/**
		* @param {Array<Event>} events
		* @param {number} start
		* @param {number} length
		* @returns {number}
		*/
		function prepareList(events, start, length) {
			let index = start - 1;
			let containerBalance = -1;
			let listSpread = false;
			/** @type {Token | undefined} */
			let listItem;
			/** @type {number | undefined} */
			let lineIndex;
			/** @type {number | undefined} */
			let firstBlankLineIndex;
			/** @type {boolean | undefined} */
			let atMarker;
			while (++index <= length) {
				const event = events[index];
				switch (event[1].type) {
					case "listUnordered":
					case "listOrdered":
					case "blockQuote":
						if (event[0] === "enter") containerBalance++;
						else containerBalance--;
						atMarker = void 0;
						break;
					case "lineEndingBlank":
						if (event[0] === "enter") {
							if (listItem && !atMarker && !containerBalance && !firstBlankLineIndex) firstBlankLineIndex = index;
							atMarker = void 0;
						}
						break;
					case "linePrefix":
					case "listItemValue":
					case "listItemMarker":
					case "listItemPrefix":
					case "listItemPrefixWhitespace": break;
					default: atMarker = void 0;
				}
				if (!containerBalance && event[0] === "enter" && event[1].type === "listItemPrefix" || containerBalance === -1 && event[0] === "exit" && (event[1].type === "listUnordered" || event[1].type === "listOrdered")) {
					if (listItem) {
						let tailIndex = index;
						lineIndex = void 0;
						while (tailIndex--) {
							const tailEvent = events[tailIndex];
							if (tailEvent[1].type === "lineEnding" || tailEvent[1].type === "lineEndingBlank") {
								if (tailEvent[0] === "exit") continue;
								if (lineIndex) {
									events[lineIndex][1].type = "lineEndingBlank";
									listSpread = true;
								}
								tailEvent[1].type = "lineEnding";
								lineIndex = tailIndex;
							} else if (tailEvent[1].type === "linePrefix" || tailEvent[1].type === "blockQuotePrefix" || tailEvent[1].type === "blockQuotePrefixWhitespace" || tailEvent[1].type === "blockQuoteMarker" || tailEvent[1].type === "listItemIndent") {} else break;
						}
						if (firstBlankLineIndex && (!lineIndex || firstBlankLineIndex < lineIndex)) listItem._spread = true;
						listItem.end = Object.assign({}, lineIndex ? events[lineIndex][1].start : event[1].end);
						events.splice(lineIndex || index, 0, [
							"exit",
							listItem,
							event[2]
						]);
						index++;
						length++;
					}
					if (event[1].type === "listItemPrefix") {
						/** @type {Token} */
						const item = {
							type: "listItem",
							_spread: false,
							start: Object.assign({}, event[1].start),
							end: void 0
						};
						listItem = item;
						events.splice(index, 0, [
							"enter",
							item,
							event[2]
						]);
						index++;
						length++;
						firstBlankLineIndex = void 0;
						atMarker = true;
					}
				}
			}
			events[start][1]._spread = listSpread;
			return length;
		}
		/**
		* Create an opener handle.
		*
		* @param {(token: Token) => Nodes} create
		*   Create a node.
		* @param {Handle | undefined} [and]
		*   Optional function to also run.
		* @returns {Handle}
		*   Handle.
		*/
		function opener(create, and) {
			return open;
			/**
			* @this {CompileContext}
			* @param {Token} token
			* @returns {undefined}
			*/
			function open(token) {
				enter.call(this, create(token), token);
				if (and) and.call(this, token);
			}
		}
		/**
		* @type {CompileContext['buffer']}
		*/
		function buffer() {
			this.stack.push({
				type: "fragment",
				children: []
			});
		}
		/**
		* @type {CompileContext['enter']}
		*/
		function enter(node, token, errorHandler) {
			this.stack[this.stack.length - 1].children.push(node);
			this.stack.push(node);
			this.tokenStack.push([token, errorHandler || void 0]);
			node.position = {
				start: point(token.start),
				end: void 0
			};
		}
		/**
		* Create a closer handle.
		*
		* @param {Handle | undefined} [and]
		*   Optional function to also run.
		* @returns {Handle}
		*   Handle.
		*/
		function closer(and) {
			return close;
			/**
			* @this {CompileContext}
			* @param {Token} token
			* @returns {undefined}
			*/
			function close(token) {
				if (and) and.call(this, token);
				exit.call(this, token);
			}
		}
		/**
		* @type {CompileContext['exit']}
		*/
		function exit(token, onExitError) {
			const node = this.stack.pop();
			const open = this.tokenStack.pop();
			if (!open) throw new Error("Cannot close `" + token.type + "` (" + stringifyPosition({
				start: token.start,
				end: token.end
			}) + "): it’s not open");
			else if (open[0].type !== token.type) if (onExitError) onExitError.call(this, token, open[0]);
			else (open[1] || defaultOnError).call(this, token, open[0]);
			node.position.end = point(token.end);
		}
		/**
		* @type {CompileContext['resume']}
		*/
		function resume() {
			return toString$1(this.stack.pop());
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onenterlistordered() {
			this.data.expectingFirstListItemValue = true;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onenterlistitemvalue(token) {
			if (this.data.expectingFirstListItemValue) {
				const ancestor = this.stack[this.stack.length - 2];
				ancestor.start = Number.parseInt(this.sliceSerialize(token), 10);
				this.data.expectingFirstListItemValue = void 0;
			}
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitcodefencedfenceinfo() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.lang = data;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitcodefencedfencemeta() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.meta = data;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitcodefencedfence() {
			if (this.data.flowCodeInside) return;
			this.buffer();
			this.data.flowCodeInside = true;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitcodefenced() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
			this.data.flowCodeInside = void 0;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitcodeindented() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.value = data.replace(/(\r?\n|\r)$/g, "");
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitdefinitionlabelstring(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.label = label;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitdefinitiontitlestring() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.title = data;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitdefinitiondestinationstring() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.url = data;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitatxheadingsequence(token) {
			const node = this.stack[this.stack.length - 1];
			if (!node.depth) node.depth = this.sliceSerialize(token).length;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitsetextheadingtext() {
			this.data.setextHeadingSlurpLineEnding = true;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitsetextheadinglinesequence(token) {
			const node = this.stack[this.stack.length - 1];
			node.depth = this.sliceSerialize(token).codePointAt(0) === 61 ? 1 : 2;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitsetextheading() {
			this.data.setextHeadingSlurpLineEnding = void 0;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onenterdata(token) {
			/** @type {Array<Nodes>} */
			const siblings = this.stack[this.stack.length - 1].children;
			let tail = siblings[siblings.length - 1];
			if (!tail || tail.type !== "text") {
				tail = text();
				tail.position = {
					start: point(token.start),
					end: void 0
				};
				siblings.push(tail);
			}
			this.stack.push(tail);
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitdata(token) {
			const tail = this.stack.pop();
			tail.value += this.sliceSerialize(token);
			tail.position.end = point(token.end);
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitlineending(token) {
			const context = this.stack[this.stack.length - 1];
			if (this.data.atHardBreak) {
				const tail = context.children[context.children.length - 1];
				tail.position.end = point(token.end);
				this.data.atHardBreak = void 0;
				return;
			}
			if (!this.data.setextHeadingSlurpLineEnding && config.canContainEols.includes(context.type)) {
				onenterdata.call(this, token);
				onexitdata.call(this, token);
			}
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexithardbreak() {
			this.data.atHardBreak = true;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexithtmlflow() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.value = data;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexithtmltext() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.value = data;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitcodetext() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.value = data;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitlink() {
			const node = this.stack[this.stack.length - 1];
			if (this.data.inReference) {
				/** @type {ReferenceType} */
				const referenceType = this.data.referenceType || "shortcut";
				node.type += "Reference";
				node.referenceType = referenceType;
				delete node.url;
				delete node.title;
			} else {
				delete node.identifier;
				delete node.label;
			}
			this.data.referenceType = void 0;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitimage() {
			const node = this.stack[this.stack.length - 1];
			if (this.data.inReference) {
				/** @type {ReferenceType} */
				const referenceType = this.data.referenceType || "shortcut";
				node.type += "Reference";
				node.referenceType = referenceType;
				delete node.url;
				delete node.title;
			} else {
				delete node.identifier;
				delete node.label;
			}
			this.data.referenceType = void 0;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitlabeltext(token) {
			const string = this.sliceSerialize(token);
			const ancestor = this.stack[this.stack.length - 2];
			ancestor.label = decodeString(string);
			ancestor.identifier = normalizeIdentifier(string).toLowerCase();
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitlabel() {
			const fragment = this.stack[this.stack.length - 1];
			const value = this.resume();
			const node = this.stack[this.stack.length - 1];
			this.data.inReference = true;
			if (node.type === "link") node.children = fragment.children;
			else node.alt = value;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitresourcedestinationstring() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.url = data;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitresourcetitlestring() {
			const data = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.title = data;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitresource() {
			this.data.inReference = void 0;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onenterreference() {
			this.data.referenceType = "collapsed";
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitreferencestring(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.label = label;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			this.data.referenceType = "full";
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitcharacterreferencemarker(token) {
			this.data.characterReferenceType = token.type;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitcharacterreferencevalue(token) {
			const data = this.sliceSerialize(token);
			const type = this.data.characterReferenceType;
			/** @type {string} */
			let value;
			if (type) {
				value = decodeNumericCharacterReference(data, type === "characterReferenceMarkerNumeric" ? 10 : 16);
				this.data.characterReferenceType = void 0;
			} else value = decodeNamedCharacterReference(data);
			const tail = this.stack[this.stack.length - 1];
			tail.value += value;
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitcharacterreference(token) {
			const tail = this.stack.pop();
			tail.position.end = point(token.end);
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitautolinkprotocol(token) {
			onexitdata.call(this, token);
			const node = this.stack[this.stack.length - 1];
			node.url = this.sliceSerialize(token);
		}
		/**
		* @this {CompileContext}
		* @type {Handle}
		*/
		function onexitautolinkemail(token) {
			onexitdata.call(this, token);
			const node = this.stack[this.stack.length - 1];
			node.url = "mailto:" + this.sliceSerialize(token);
		}
		/** @returns {Blockquote} */
		function blockQuote() {
			return {
				type: "blockquote",
				children: []
			};
		}
		/** @returns {Code} */
		function codeFlow() {
			return {
				type: "code",
				lang: null,
				meta: null,
				value: ""
			};
		}
		/** @returns {InlineCode} */
		function codeText() {
			return {
				type: "inlineCode",
				value: ""
			};
		}
		/** @returns {Definition} */
		function definition() {
			return {
				type: "definition",
				identifier: "",
				label: null,
				title: null,
				url: ""
			};
		}
		/** @returns {Emphasis} */
		function emphasis() {
			return {
				type: "emphasis",
				children: []
			};
		}
		/** @returns {Heading} */
		function heading() {
			return {
				type: "heading",
				depth: 0,
				children: []
			};
		}
		/** @returns {Break} */
		function hardBreak() {
			return { type: "break" };
		}
		/** @returns {Html} */
		function html() {
			return {
				type: "html",
				value: ""
			};
		}
		/** @returns {Image} */
		function image() {
			return {
				type: "image",
				title: null,
				url: "",
				alt: null
			};
		}
		/** @returns {Link} */
		function link() {
			return {
				type: "link",
				title: null,
				url: "",
				children: []
			};
		}
		/**
		* @param {Token} token
		* @returns {List}
		*/
		function list(token) {
			return {
				type: "list",
				ordered: token.type === "listOrdered",
				start: null,
				spread: token._spread,
				children: []
			};
		}
		/**
		* @param {Token} token
		* @returns {ListItem}
		*/
		function listItem(token) {
			return {
				type: "listItem",
				spread: token._spread,
				checked: null,
				children: []
			};
		}
		/** @returns {Paragraph} */
		function paragraph() {
			return {
				type: "paragraph",
				children: []
			};
		}
		/** @returns {Strong} */
		function strong() {
			return {
				type: "strong",
				children: []
			};
		}
		/** @returns {Text} */
		function text() {
			return {
				type: "text",
				value: ""
			};
		}
		/** @returns {ThematicBreak} */
		function thematicBreak() {
			return { type: "thematicBreak" };
		}
	}
	/**
	* Copy a point-like value.
	*
	* @param {Point} d
	*   Point-like value.
	* @returns {Point}
	*   unist point.
	*/
	function point(d) {
		return {
			line: d.line,
			column: d.column,
			offset: d.offset
		};
	}
	/**
	* @param {Config} combined
	* @param {Array<Array<Extension> | Extension>} extensions
	* @returns {undefined}
	*/
	function configure$1(combined, extensions) {
		let index = -1;
		while (++index < extensions.length) {
			const value = extensions[index];
			if (Array.isArray(value)) configure$1(combined, value);
			else extension(combined, value);
		}
	}
	/**
	* @param {Config} combined
	* @param {Extension} extension
	* @returns {undefined}
	*/
	function extension(combined, extension) {
		/** @type {keyof Extension} */
		let key;
		for (key in extension) if (own$2.call(extension, key)) switch (key) {
			case "canContainEols": {
				const right = extension[key];
				if (right) combined[key].push(...right);
				break;
			}
			case "transforms": {
				const right = extension[key];
				if (right) combined[key].push(...right);
				break;
			}
			case "enter":
			case "exit": {
				const right = extension[key];
				if (right) Object.assign(combined[key], right);
				break;
			}
		}
	}
	/** @type {OnEnterError} */
	function defaultOnError(left, right) {
		if (left) throw new Error("Cannot close `" + left.type + "` (" + stringifyPosition({
			start: left.start,
			end: left.end
		}) + "): a different token (`" + right.type + "`, " + stringifyPosition({
			start: right.start,
			end: right.end
		}) + ") is open");
		else throw new Error("Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
			start: right.start,
			end: right.end
		}) + ") is still open");
	}
	//#endregion
	//#region node_modules/remark-parse/lib/index.js
	/**
	* @typedef {import('mdast').Root} Root
	* @typedef {import('mdast-util-from-markdown').Options} FromMarkdownOptions
	* @typedef {import('unified').Parser<Root>} Parser
	* @typedef {import('unified').Processor<Root>} Processor
	*/
	/**
	* @typedef {Omit<FromMarkdownOptions, 'extensions' | 'mdastExtensions'>} Options
	*/
	/**
	* Aadd support for parsing from markdown.
	*
	* @param {Readonly<Options> | null | undefined} [options]
	*   Configuration (optional).
	* @returns {undefined}
	*   Nothing.
	*/
	function remarkParse(options) {
		/** @type {Processor} */
		const self = this;
		self.parser = parser;
		/**
		* @type {Parser}
		*/
		function parser(doc) {
			return fromMarkdown(doc, {
				...self.data("settings"),
				...options,
				extensions: self.data("micromarkExtensions") || [],
				mdastExtensions: self.data("fromMarkdownExtensions") || []
			});
		}
	}
	//#endregion
	//#region node_modules/zwitch/index.js
	/**
	* @callback Handler
	*   Handle a value, with a certain ID field set to a certain value.
	*   The ID field is passed to `zwitch`, and it’s value is this function’s
	*   place on the `handlers` record.
	* @param {...any} parameters
	*   Arbitrary parameters passed to the zwitch.
	*   The first will be an object with a certain ID field set to a certain value.
	* @returns {any}
	*   Anything!
	*/
	/**
	* @callback UnknownHandler
	*   Handle values that do have a certain ID field, but it’s set to a value
	*   that is not listed in the `handlers` record.
	* @param {unknown} value
	*   An object with a certain ID field set to an unknown value.
	* @param {...any} rest
	*   Arbitrary parameters passed to the zwitch.
	* @returns {any}
	*   Anything!
	*/
	/**
	* @callback InvalidHandler
	*   Handle values that do not have a certain ID field.
	* @param {unknown} value
	*   Any unknown value.
	* @param {...any} rest
	*   Arbitrary parameters passed to the zwitch.
	* @returns {void|null|undefined|never}
	*   This should crash or return nothing.
	*/
	/**
	* @template {InvalidHandler} [Invalid=InvalidHandler]
	* @template {UnknownHandler} [Unknown=UnknownHandler]
	* @template {Record<string, Handler>} [Handlers=Record<string, Handler>]
	* @typedef Options
	*   Configuration (required).
	* @property {Invalid} [invalid]
	*   Handler to use for invalid values.
	* @property {Unknown} [unknown]
	*   Handler to use for unknown values.
	* @property {Handlers} [handlers]
	*   Handlers to use.
	*/
	var own$1 = {}.hasOwnProperty;
	/**
	* Handle values based on a field.
	*
	* @template {InvalidHandler} [Invalid=InvalidHandler]
	* @template {UnknownHandler} [Unknown=UnknownHandler]
	* @template {Record<string, Handler>} [Handlers=Record<string, Handler>]
	* @param {string} key
	*   Field to switch on.
	* @param {Options<Invalid, Unknown, Handlers>} [options]
	*   Configuration (required).
	* @returns {{unknown: Unknown, invalid: Invalid, handlers: Handlers, (...parameters: Parameters<Handlers[keyof Handlers]>): ReturnType<Handlers[keyof Handlers]>, (...parameters: Parameters<Unknown>): ReturnType<Unknown>}}
	*/
	function zwitch(key, options) {
		const settings = options || {};
		/**
		* Handle one value.
		*
		* Based on the bound `key`, a respective handler will be called.
		* If `value` is not an object, or doesn’t have a `key` property, the special
		* “invalid” handler will be called.
		* If `value` has an unknown `key`, the special “unknown” handler will be
		* called.
		*
		* All arguments, and the context object, are passed through to the handler,
		* and it’s result is returned.
		*
		* @this {unknown}
		*   Any context object.
		* @param {unknown} [value]
		*   Any value.
		* @param {...unknown} parameters
		*   Arbitrary parameters passed to the zwitch.
		* @property {Handler} invalid
		*   Handle for values that do not have a certain ID field.
		* @property {Handler} unknown
		*   Handle values that do have a certain ID field, but it’s set to a value
		*   that is not listed in the `handlers` record.
		* @property {Handlers} handlers
		*   Record of handlers.
		* @returns {unknown}
		*   Anything.
		*/
		function one(value, ...parameters) {
			/** @type {Handler|undefined} */
			let fn = one.invalid;
			const handlers = one.handlers;
			if (value && own$1.call(value, key)) {
				const id = String(value[key]);
				fn = own$1.call(handlers, id) ? handlers[id] : one.unknown;
			}
			if (fn) return fn.call(this, value, ...parameters);
		}
		one.handlers = settings.handlers || {};
		one.invalid = settings.invalid;
		one.unknown = settings.unknown;
		return one;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/configure.js
	/**
	* @import {Options, State} from './types.js'
	*/
	var own = {}.hasOwnProperty;
	/**
	* @param {State} base
	* @param {Options} extension
	* @returns {State}
	*/
	function configure(base, extension) {
		let index = -1;
		/** @type {keyof Options} */
		let key;
		if (extension.extensions) while (++index < extension.extensions.length) configure(base, extension.extensions[index]);
		for (key in extension) if (own.call(extension, key)) switch (key) {
			case "extensions": break;
			/* c8 ignore next 4 */
			case "unsafe":
				list$2(base[key], extension[key]);
				break;
			case "join":
				list$2(base[key], extension[key]);
				break;
			case "handlers":
				map$4(base[key], extension[key]);
				break;
			default: base.options[key] = extension[key];
		}
		return base;
	}
	/**
	* @template T
	* @param {Array<T>} left
	* @param {Array<T> | null | undefined} right
	*/
	function list$2(left, right) {
		if (right) left.push(...right);
	}
	/**
	* @template T
	* @param {Record<string, T>} left
	* @param {Record<string, T> | null | undefined} right
	*/
	function map$4(left, right) {
		if (right) Object.assign(left, right);
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/blockquote.js
	/**
	* @import {Blockquote, Parents} from 'mdast'
	* @import {Info, Map, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {Blockquote} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function blockquote$1(node, _, state, info) {
		const exit = state.enter("blockquote");
		const tracker = state.createTracker(info);
		tracker.move("> ");
		tracker.shift(2);
		const value = state.indentLines(state.containerFlow(node, tracker.current()), map$3);
		exit();
		return value;
	}
	/** @type {Map} */
	function map$3(line, _, blank) {
		return ">" + (blank ? "" : " ") + line;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js
	/**
	* @import {ConstructName, Unsafe} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {Array<ConstructName>} stack
	* @param {Unsafe} pattern
	* @returns {boolean}
	*/
	function patternInScope$1(stack, pattern) {
		return listInScope$1(stack, pattern.inConstruct, true) && !listInScope$1(stack, pattern.notInConstruct, false);
	}
	/**
	* @param {Array<ConstructName>} stack
	* @param {Unsafe['inConstruct']} list
	* @param {boolean} none
	* @returns {boolean}
	*/
	function listInScope$1(stack, list, none) {
		if (typeof list === "string") list = [list];
		if (!list || list.length === 0) return none;
		let index = -1;
		while (++index < list.length) if (stack.includes(list[index])) return true;
		return false;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/break.js
	/**
	* @import {Break, Parents} from 'mdast'
	* @import {Info, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {Break} _
	* @param {Parents | undefined} _1
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function hardBreak$1(_, _1, state, info) {
		let index = -1;
		while (++index < state.unsafe.length) if (state.unsafe[index].character === "\n" && patternInScope$1(state.stack, state.unsafe[index])) return /[ \t]/.test(info.before) ? "" : " ";
		return "\\\n";
	}
	//#endregion
	//#region node_modules/longest-streak/index.js
	/**
	* Get the count of the longest repeating streak of `substring` in `value`.
	*
	* @param {string} value
	*   Content to search in.
	* @param {string} substring
	*   Substring to look for, typically one character.
	* @returns {number}
	*   Count of most frequent adjacent `substring`s in `value`.
	*/
	function longestStreak$1(value, substring) {
		const source = String(value);
		let index = source.indexOf(substring);
		let expected = index;
		let count = 0;
		let max = 0;
		if (typeof substring !== "string") throw new TypeError("Expected substring");
		while (index !== -1) {
			if (index === expected) {
				if (++count > max) max = count;
			} else count = 1;
			expected = index + substring.length;
			index = source.indexOf(substring, expected);
		}
		return max;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js
	/**
	* @import {State} from 'mdast-util-to-markdown'
	* @import {Code} from 'mdast'
	*/
	/**
	* @param {Code} node
	* @param {State} state
	* @returns {boolean}
	*/
	function formatCodeAsIndented$1(node, state) {
		return Boolean(state.options.fences === false && node.value && !node.lang && /[^ \r\n]/.test(node.value) && !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(node.value));
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-fence.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['fence'], null | undefined>}
	*/
	function checkFence$1(state) {
		const marker = state.options.fence || "`";
		if (marker !== "`" && marker !== "~") throw new Error("Cannot serialize code with `" + marker + "` for `options.fence`, expected `` ` `` or `~`");
		return marker;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/code.js
	/**
	* @import {Info, Map, State} from 'mdast-util-to-markdown'
	* @import {Code, Parents} from 'mdast'
	*/
	/**
	* @param {Code} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function code$2(node, _, state, info) {
		const marker = checkFence$1(state);
		const raw = node.value || "";
		const suffix = marker === "`" ? "GraveAccent" : "Tilde";
		if (formatCodeAsIndented$1(node, state)) {
			const exit = state.enter("codeIndented");
			const value = state.indentLines(raw, map$2);
			exit();
			return value;
		}
		const tracker = state.createTracker(info);
		const sequence = marker.repeat(Math.max(longestStreak$1(raw, marker) + 1, 3));
		const exit = state.enter("codeFenced");
		let value = tracker.move(sequence);
		if (node.lang) {
			const subexit = state.enter(`codeFencedLang${suffix}`);
			value += tracker.move(state.safe(node.lang, {
				before: value,
				after: " ",
				encode: ["`"],
				...tracker.current()
			}));
			subexit();
		}
		if (node.lang && node.meta) {
			const subexit = state.enter(`codeFencedMeta${suffix}`);
			value += tracker.move(" ");
			value += tracker.move(state.safe(node.meta, {
				before: value,
				after: "\n",
				encode: ["`"],
				...tracker.current()
			}));
			subexit();
		}
		value += tracker.move("\n");
		if (raw) value += tracker.move(raw + "\n");
		value += tracker.move(sequence);
		exit();
		return value;
	}
	/** @type {Map} */
	function map$2(line, _, blank) {
		return (blank ? "" : "    ") + line;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-quote.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['quote'], null | undefined>}
	*/
	function checkQuote$1(state) {
		const marker = state.options.quote || "\"";
		if (marker !== "\"" && marker !== "'") throw new Error("Cannot serialize title with `" + marker + "` for `options.quote`, expected `\"`, or `'`");
		return marker;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/definition.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {Definition, Parents} from 'mdast'
	*/
	/**
	* @param {Definition} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function definition$1(node, _, state, info) {
		const quote = checkQuote$1(state);
		const suffix = quote === "\"" ? "Quote" : "Apostrophe";
		const exit = state.enter("definition");
		let subexit = state.enter("label");
		const tracker = state.createTracker(info);
		let value = tracker.move("[");
		value += tracker.move(state.safe(state.associationId(node), {
			before: value,
			after: "]",
			...tracker.current()
		}));
		value += tracker.move("]: ");
		subexit();
		if (!node.url || /[\0- \u007F]/.test(node.url)) {
			subexit = state.enter("destinationLiteral");
			value += tracker.move("<");
			value += tracker.move(state.safe(node.url, {
				before: value,
				after: ">",
				...tracker.current()
			}));
			value += tracker.move(">");
		} else {
			subexit = state.enter("destinationRaw");
			value += tracker.move(state.safe(node.url, {
				before: value,
				after: node.title ? " " : "\n",
				...tracker.current()
			}));
		}
		subexit();
		if (node.title) {
			subexit = state.enter(`title${suffix}`);
			value += tracker.move(" " + quote);
			value += tracker.move(state.safe(node.title, {
				before: value,
				after: quote,
				...tracker.current()
			}));
			value += tracker.move(quote);
			subexit();
		}
		exit();
		return value;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-emphasis.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['emphasis'], null | undefined>}
	*/
	function checkEmphasis$1(state) {
		const marker = state.options.emphasis || "*";
		if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize emphasis with `" + marker + "` for `options.emphasis`, expected `*`, or `_`");
		return marker;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/encode-character-reference.js
	/**
	* Encode a code point as a character reference.
	*
	* @param {number} code
	*   Code point to encode.
	* @returns {string}
	*   Encoded character reference.
	*/
	function encodeCharacterReference$1(code) {
		return "&#x" + code.toString(16).toUpperCase() + ";";
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/encode-info.js
	/**
	* @import {EncodeSides} from '../types.js'
	*/
	/**
	* Check whether to encode (as a character reference) the characters
	* surrounding an attention run.
	*
	* Which characters are around an attention run influence whether it works or
	* not.
	*
	* See <https://github.com/orgs/syntax-tree/discussions/60> for more info.
	* See this markdown in a particular renderer to see what works:
	*
	* ```markdown
	* |                         | A (letter inside) | B (punctuation inside) | C (whitespace inside) | D (nothing inside) |
	* | ----------------------- | ----------------- | ---------------------- | --------------------- | ------------------ |
	* | 1 (letter outside)      | x*y*z             | x*.*z                  | x* *z                 | x**z               |
	* | 2 (punctuation outside) | .*y*.             | .*.*.                  | .* *.                 | .**.               |
	* | 3 (whitespace outside)  | x *y* z           | x *.* z                | x * * z               | x ** z             |
	* | 4 (nothing outside)     | *x*               | *.*                    | * *                   | **                 |
	* ```
	*
	* @param {number} outside
	*   Code point on the outer side of the run.
	* @param {number} inside
	*   Code point on the inner side of the run.
	* @param {'*' | '_'} marker
	*   Marker of the run.
	*   Underscores are handled more strictly (they form less often) than
	*   asterisks.
	* @returns {EncodeSides}
	*   Whether to encode characters.
	*/
	function encodeInfo$1(outside, inside, marker) {
		const outsideKind = classifyCharacter$1(outside);
		const insideKind = classifyCharacter$1(inside);
		if (outsideKind === void 0) return insideKind === void 0 ? marker === "_" ? {
			inside: true,
			outside: true
		} : {
			inside: false,
			outside: false
		} : insideKind === 1 ? {
			inside: true,
			outside: true
		} : {
			inside: false,
			outside: true
		};
		if (outsideKind === 1) return insideKind === void 0 ? {
			inside: false,
			outside: false
		} : insideKind === 1 ? {
			inside: true,
			outside: true
		} : {
			inside: false,
			outside: false
		};
		return insideKind === void 0 ? {
			inside: false,
			outside: false
		} : insideKind === 1 ? {
			inside: true,
			outside: false
		} : {
			inside: false,
			outside: false
		};
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/emphasis.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {Emphasis, Parents} from 'mdast'
	*/
	emphasis$1.peek = emphasisPeek$1;
	/**
	* @param {Emphasis} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function emphasis$1(node, _, state, info) {
		const marker = checkEmphasis$1(state);
		const exit = state.enter("emphasis");
		const tracker = state.createTracker(info);
		const before = tracker.move(marker);
		let between = tracker.move(state.containerPhrasing(node, {
			after: marker,
			before,
			...tracker.current()
		}));
		const betweenHead = between.charCodeAt(0);
		const open = encodeInfo$1(info.before.charCodeAt(info.before.length - 1), betweenHead, marker);
		if (open.inside) between = encodeCharacterReference$1(betweenHead) + between.slice(1);
		const betweenTail = between.charCodeAt(between.length - 1);
		const close = encodeInfo$1(info.after.charCodeAt(0), betweenTail, marker);
		if (close.inside) between = between.slice(0, -1) + encodeCharacterReference$1(betweenTail);
		const after = tracker.move(marker);
		exit();
		state.attentionEncodeSurroundingInfo = {
			after: close.outside,
			before: open.outside
		};
		return before + between + after;
	}
	/**
	* @param {Emphasis} _
	* @param {Parents | undefined} _1
	* @param {State} state
	* @returns {string}
	*/
	function emphasisPeek$1(_, _1, state) {
		return state.options.emphasis || "*";
	}
	//#endregion
	//#region node_modules/unist-util-is/lib/index.js
	/**
	* Generate an assertion from a test.
	*
	* Useful if you’re going to test many nodes, for example when creating a
	* utility where something else passes a compatible test.
	*
	* The created function is a bit faster because it expects valid input only:
	* a `node`, `index`, and `parent`.
	*
	* @param {Test} test
	*   *   when nullish, checks if `node` is a `Node`.
	*   *   when `string`, works like passing `(node) => node.type === test`.
	*   *   when `function` checks if function passed the node is true.
	*   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
	*   *   when `array`, checks if any one of the subtests pass.
	* @returns {Check}
	*   An assertion.
	*/
	var convert$1 = (function(test) {
		if (test === null || test === void 0) return ok$1;
		if (typeof test === "function") return castFactory$1(test);
		if (typeof test === "object") return Array.isArray(test) ? anyFactory$1(test) : propertiesFactory$1(test);
		if (typeof test === "string") return typeFactory$1(test);
		throw new Error("Expected function, string, or object as test");
	});
	/**
	* @param {Array<Props | TestFunction | string>} tests
	* @returns {Check}
	*/
	function anyFactory$1(tests) {
		/** @type {Array<Check>} */
		const checks = [];
		let index = -1;
		while (++index < tests.length) checks[index] = convert$1(tests[index]);
		return castFactory$1(any);
		/**
		* @this {unknown}
		* @type {TestFunction}
		*/
		function any(...parameters) {
			let index = -1;
			while (++index < checks.length) if (checks[index].apply(this, parameters)) return true;
			return false;
		}
	}
	/**
	* Turn an object into a test for a node with a certain fields.
	*
	* @param {Props} check
	* @returns {Check}
	*/
	function propertiesFactory$1(check) {
		const checkAsRecord = check;
		return castFactory$1(all);
		/**
		* @param {Node} node
		* @returns {boolean}
		*/
		function all(node) {
			const nodeAsRecord = node;
			/** @type {string} */
			let key;
			for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
			return true;
		}
	}
	/**
	* Turn a string into a test for a node with a certain type.
	*
	* @param {string} check
	* @returns {Check}
	*/
	function typeFactory$1(check) {
		return castFactory$1(type);
		/**
		* @param {Node} node
		*/
		function type(node) {
			return node && node.type === check;
		}
	}
	/**
	* Turn a custom test into a test for a node that passes that test.
	*
	* @param {TestFunction} testFunction
	* @returns {Check}
	*/
	function castFactory$1(testFunction) {
		return check;
		/**
		* @this {unknown}
		* @type {Check}
		*/
		function check(value, index, parent) {
			return Boolean(looksLikeANode$1(value) && testFunction.call(this, value, typeof index === "number" ? index : void 0, parent || void 0));
		}
	}
	function ok$1() {
		return true;
	}
	/**
	* @param {unknown} value
	* @returns {value is Node}
	*/
	function looksLikeANode$1(value) {
		return value !== null && typeof value === "object" && "type" in value;
	}
	//#endregion
	//#region node_modules/unist-util-visit-parents/lib/color.js
	/**
	* @param {string} d
	* @returns {string}
	*/
	function color$1(d) {
		return d;
	}
	//#endregion
	//#region node_modules/unist-util-visit-parents/lib/index.js
	/**
	* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
	*/
	/**
	* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
	*   Test from `unist-util-is`.
	*
	*   Note: we have remove and add `undefined`, because otherwise when generating
	*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
	*   which doesn’t work when publishing on npm.
	*/
	/**
	* @typedef {(
	*   Fn extends (value: any) => value is infer Thing
	*   ? Thing
	*   : Fallback
	* )} Predicate
	*   Get the value of a type guard `Fn`.
	* @template Fn
	*   Value; typically function that is a type guard (such as `(x): x is Y`).
	* @template Fallback
	*   Value to yield if `Fn` is not a type guard.
	*/
	/**
	* @typedef {(
	*   Check extends null | undefined // No test.
	*   ? Value
	*   : Value extends {type: Check} // String (type) test.
	*   ? Value
	*   : Value extends Check // Partial test.
	*   ? Value
	*   : Check extends Function // Function test.
	*   ? Predicate<Check, Value> extends Value
	*     ? Predicate<Check, Value>
	*     : never
	*   : never // Some other test?
	* )} MatchesOne
	*   Check whether a node matches a primitive check in the type system.
	* @template Value
	*   Value; typically unist `Node`.
	* @template Check
	*   Value; typically `unist-util-is`-compatible test, but not arrays.
	*/
	/**
	* @typedef {(
	*   Check extends ReadonlyArray<infer T>
	*   ? MatchesOne<Value, T>
	*   : Check extends Array<infer T>
	*   ? MatchesOne<Value, T>
	*   : MatchesOne<Value, Check>
	* )} Matches
	*   Check whether a node matches a check in the type system.
	* @template Value
	*   Value; typically unist `Node`.
	* @template Check
	*   Value; typically `unist-util-is`-compatible test.
	*/
	/**
	* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
	*   Number; capped reasonably.
	*/
	/**
	* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
	*   Increment a number in the type system.
	* @template {Uint} [I=0]
	*   Index.
	*/
	/**
	* @typedef {(
	*   Node extends UnistParent
	*   ? Node extends {children: Array<infer Children>}
	*     ? Child extends Children ? Node : never
	*     : never
	*   : never
	* )} InternalParent
	*   Collect nodes that can be parents of `Child`.
	* @template {UnistNode} Node
	*   All node types in a tree.
	* @template {UnistNode} Child
	*   Node to search for.
	*/
	/**
	* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
	*   Collect nodes in `Tree` that can be parents of `Child`.
	* @template {UnistNode} Tree
	*   All node types in a tree.
	* @template {UnistNode} Child
	*   Node to search for.
	*/
	/**
	* @typedef {(
	*   Depth extends Max
	*   ? never
	*   :
	*     | InternalParent<Node, Child>
	*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
	* )} InternalAncestor
	*   Collect nodes in `Tree` that can be ancestors of `Child`.
	* @template {UnistNode} Node
	*   All node types in a tree.
	* @template {UnistNode} Child
	*   Node to search for.
	* @template {Uint} [Max=10]
	*   Max; searches up to this depth.
	* @template {Uint} [Depth=0]
	*   Current depth.
	*/
	/**
	* @typedef {InternalAncestor<InclusiveDescendant<Tree>, Child>} Ancestor
	*   Collect nodes in `Tree` that can be ancestors of `Child`.
	* @template {UnistNode} Tree
	*   All node types in a tree.
	* @template {UnistNode} Child
	*   Node to search for.
	*/
	/**
	* @typedef {(
	*   Tree extends UnistParent
	*     ? Depth extends Max
	*       ? Tree
	*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
	*     : Tree
	* )} InclusiveDescendant
	*   Collect all (inclusive) descendants of `Tree`.
	*
	*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
	*   > recurse without actually running into an infinite loop, which the
	*   > previous version did.
	*   >
	*   > Practically, a max of `2` is typically enough assuming a `Root` is
	*   > passed, but it doesn’t improve performance.
	*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
	*   > Using up to `10` doesn’t hurt or help either.
	* @template {UnistNode} Tree
	*   Tree type.
	* @template {Uint} [Max=10]
	*   Max; searches up to this depth.
	* @template {Uint} [Depth=0]
	*   Current depth.
	*/
	/**
	* @typedef {'skip' | boolean} Action
	*   Union of the action types.
	*
	* @typedef {number} Index
	*   Move to the sibling at `index` next (after node itself is completely
	*   traversed).
	*
	*   Useful if mutating the tree, such as removing the node the visitor is
	*   currently on, or any of its previous siblings.
	*   Results less than 0 or greater than or equal to `children.length` stop
	*   traversing the parent.
	*
	* @typedef {[(Action | null | undefined | void)?, (Index | null | undefined)?]} ActionTuple
	*   List with one or two values, the first an action, the second an index.
	*
	* @typedef {Action | ActionTuple | Index | null | undefined | void} VisitorResult
	*   Any value that can be returned from a visitor.
	*/
	/**
	* @callback Visitor
	*   Handle a node (matching `test`, if given).
	*
	*   Visitors are free to transform `node`.
	*   They can also transform the parent of node (the last of `ancestors`).
	*
	*   Replacing `node` itself, if `SKIP` is not returned, still causes its
	*   descendants to be walked (which is a bug).
	*
	*   When adding or removing previous siblings of `node` (or next siblings, in
	*   case of reverse), the `Visitor` should return a new `Index` to specify the
	*   sibling to traverse after `node` is traversed.
	*   Adding or removing next siblings of `node` (or previous siblings, in case
	*   of reverse) is handled as expected without needing to return a new `Index`.
	*
	*   Removing the children property of an ancestor still results in them being
	*   traversed.
	* @param {Visited} node
	*   Found node.
	* @param {Array<VisitedParents>} ancestors
	*   Ancestors of `node`.
	* @returns {VisitorResult}
	*   What to do next.
	*
	*   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
	*   An `Action` is treated as a tuple of `[Action]`.
	*
	*   Passing a tuple back only makes sense if the `Action` is `SKIP`.
	*   When the `Action` is `EXIT`, that action can be returned.
	*   When the `Action` is `CONTINUE`, `Index` can be returned.
	* @template {UnistNode} [Visited=UnistNode]
	*   Visited node type.
	* @template {UnistParent} [VisitedParents=UnistParent]
	*   Ancestor type.
	*/
	/**
	* @typedef {Visitor<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitor
	*   Build a typed `Visitor` function from a tree and a test.
	*
	*   It will infer which values are passed as `node` and which as `parents`.
	* @template {UnistNode} [Tree=UnistNode]
	*   Tree type.
	* @template {Test} [Check=Test]
	*   Test type.
	*/
	/** @type {Readonly<ActionTuple>} */
	var empty$1 = [];
	/**
	* Visit nodes, with ancestral information.
	*
	* This algorithm performs *depth-first* *tree traversal* in *preorder*
	* (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
	*
	* You can choose for which nodes `visitor` is called by passing a `test`.
	* For complex tests, you should test yourself in `visitor`, as it will be
	* faster and will have improved type information.
	*
	* Walking the tree is an intensive task.
	* Make use of the return values of the visitor when possible.
	* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
	* to check if a node matches, and then perform different operations.
	*
	* You can change the tree.
	* See `Visitor` for more info.
	*
	* @overload
	* @param {Tree} tree
	* @param {Check} check
	* @param {BuildVisitor<Tree, Check>} visitor
	* @param {boolean | null | undefined} [reverse]
	* @returns {undefined}
	*
	* @overload
	* @param {Tree} tree
	* @param {BuildVisitor<Tree>} visitor
	* @param {boolean | null | undefined} [reverse]
	* @returns {undefined}
	*
	* @param {UnistNode} tree
	*   Tree to traverse.
	* @param {Visitor | Test} test
	*   `unist-util-is`-compatible test
	* @param {Visitor | boolean | null | undefined} [visitor]
	*   Handle each node.
	* @param {boolean | null | undefined} [reverse]
	*   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
	* @returns {undefined}
	*   Nothing.
	*
	* @template {UnistNode} Tree
	*   Node type.
	* @template {Test} Check
	*   `unist-util-is`-compatible test.
	*/
	function visitParents$1(tree, test, visitor, reverse) {
		/** @type {Test} */
		let check;
		if (typeof test === "function" && typeof visitor !== "function") {
			reverse = visitor;
			visitor = test;
		} else check = test;
		const is = convert$1(check);
		const step = reverse ? -1 : 1;
		factory(tree, void 0, [])();
		/**
		* @param {UnistNode} node
		* @param {number | undefined} index
		* @param {Array<UnistParent>} parents
		*/
		function factory(node, index, parents) {
			const value = node && typeof node === "object" ? node : {};
			if (typeof value.type === "string") {
				const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
				Object.defineProperty(visit, "name", { value: "node (" + color$1(node.type + (name ? "<" + name + ">" : "")) + ")" });
			}
			return visit;
			function visit() {
				/** @type {Readonly<ActionTuple>} */
				let result = empty$1;
				/** @type {Readonly<ActionTuple>} */
				let subresult;
				/** @type {number} */
				let offset;
				/** @type {Array<UnistParent>} */
				let grandparents;
				if (!test || is(node, index, parents[parents.length - 1] || void 0)) {
					result = toResult$1(visitor(node, parents));
					if (result[0] === false) return result;
				}
				if ("children" in node && node.children) {
					const nodeAsParent = node;
					if (nodeAsParent.children && result[0] !== "skip") {
						offset = (reverse ? nodeAsParent.children.length : -1) + step;
						grandparents = parents.concat(nodeAsParent);
						while (offset > -1 && offset < nodeAsParent.children.length) {
							const child = nodeAsParent.children[offset];
							subresult = factory(child, offset, grandparents)();
							if (subresult[0] === false) return subresult;
							offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
						}
					}
				}
				return result;
			}
		}
	}
	/**
	* Turn a return value into a clean result.
	*
	* @param {VisitorResult} value
	*   Valid return values from visitors.
	* @returns {Readonly<ActionTuple>}
	*   Clean result.
	*/
	function toResult$1(value) {
		if (Array.isArray(value)) return value;
		if (typeof value === "number") return [true, value];
		return value === null || value === void 0 ? empty$1 : [value];
	}
	//#endregion
	//#region node_modules/unist-util-visit/lib/index.js
	/**
	* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
	* @import {VisitorResult} from 'unist-util-visit-parents'
	*/
	/**
	* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
	*   Test from `unist-util-is`.
	*
	*   Note: we have remove and add `undefined`, because otherwise when generating
	*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
	*   which doesn’t work when publishing on npm.
	*/
	/**
	* @typedef {(
	*   Fn extends (value: any) => value is infer Thing
	*   ? Thing
	*   : Fallback
	* )} Predicate
	*   Get the value of a type guard `Fn`.
	* @template Fn
	*   Value; typically function that is a type guard (such as `(x): x is Y`).
	* @template Fallback
	*   Value to yield if `Fn` is not a type guard.
	*/
	/**
	* @typedef {(
	*   Check extends null | undefined // No test.
	*   ? Value
	*   : Value extends {type: Check} // String (type) test.
	*   ? Value
	*   : Value extends Check // Partial test.
	*   ? Value
	*   : Check extends Function // Function test.
	*   ? Predicate<Check, Value> extends Value
	*     ? Predicate<Check, Value>
	*     : never
	*   : never // Some other test?
	* )} MatchesOne
	*   Check whether a node matches a primitive check in the type system.
	* @template Value
	*   Value; typically unist `Node`.
	* @template Check
	*   Value; typically `unist-util-is`-compatible test, but not arrays.
	*/
	/**
	* @typedef {(
	*   Check extends ReadonlyArray<any>
	*   ? MatchesOne<Value, Check[number]>
	*   : MatchesOne<Value, Check>
	* )} Matches
	*   Check whether a node matches a check in the type system.
	* @template Value
	*   Value; typically unist `Node`.
	* @template Check
	*   Value; typically `unist-util-is`-compatible test.
	*/
	/**
	* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
	*   Number; capped reasonably.
	*/
	/**
	* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
	*   Increment a number in the type system.
	* @template {Uint} [I=0]
	*   Index.
	*/
	/**
	* @typedef {(
	*   Node extends UnistParent
	*   ? Node extends {children: Array<infer Children>}
	*     ? Child extends Children ? Node : never
	*     : never
	*   : never
	* )} InternalParent
	*   Collect nodes that can be parents of `Child`.
	* @template {UnistNode} Node
	*   All node types in a tree.
	* @template {UnistNode} Child
	*   Node to search for.
	*/
	/**
	* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
	*   Collect nodes in `Tree` that can be parents of `Child`.
	* @template {UnistNode} Tree
	*   All node types in a tree.
	* @template {UnistNode} Child
	*   Node to search for.
	*/
	/**
	* @typedef {(
	*   Depth extends Max
	*   ? never
	*   :
	*     | InternalParent<Node, Child>
	*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
	* )} InternalAncestor
	*   Collect nodes in `Tree` that can be ancestors of `Child`.
	* @template {UnistNode} Node
	*   All node types in a tree.
	* @template {UnistNode} Child
	*   Node to search for.
	* @template {Uint} [Max=10]
	*   Max; searches up to this depth.
	* @template {Uint} [Depth=0]
	*   Current depth.
	*/
	/**
	* @typedef {(
	*   Tree extends UnistParent
	*     ? Depth extends Max
	*       ? Tree
	*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
	*     : Tree
	* )} InclusiveDescendant
	*   Collect all (inclusive) descendants of `Tree`.
	*
	*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
	*   > recurse without actually running into an infinite loop, which the
	*   > previous version did.
	*   >
	*   > Practically, a max of `2` is typically enough assuming a `Root` is
	*   > passed, but it doesn’t improve performance.
	*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
	*   > Using up to `10` doesn’t hurt or help either.
	* @template {UnistNode} Tree
	*   Tree type.
	* @template {Uint} [Max=10]
	*   Max; searches up to this depth.
	* @template {Uint} [Depth=0]
	*   Current depth.
	*/
	/**
	* @callback Visitor
	*   Handle a node (matching `test`, if given).
	*
	*   Visitors are free to transform `node`.
	*   They can also transform `parent`.
	*
	*   Replacing `node` itself, if `SKIP` is not returned, still causes its
	*   descendants to be walked (which is a bug).
	*
	*   When adding or removing previous siblings of `node` (or next siblings, in
	*   case of reverse), the `Visitor` should return a new `Index` to specify the
	*   sibling to traverse after `node` is traversed.
	*   Adding or removing next siblings of `node` (or previous siblings, in case
	*   of reverse) is handled as expected without needing to return a new `Index`.
	*
	*   Removing the children property of `parent` still results in them being
	*   traversed.
	* @param {Visited} node
	*   Found node.
	* @param {Visited extends UnistNode ? number | undefined : never} index
	*   Index of `node` in `parent`.
	* @param {Ancestor extends UnistParent ? Ancestor | undefined : never} parent
	*   Parent of `node`.
	* @returns {VisitorResult}
	*   What to do next.
	*
	*   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
	*   An `Action` is treated as a tuple of `[Action]`.
	*
	*   Passing a tuple back only makes sense if the `Action` is `SKIP`.
	*   When the `Action` is `EXIT`, that action can be returned.
	*   When the `Action` is `CONTINUE`, `Index` can be returned.
	* @template {UnistNode} [Visited=UnistNode]
	*   Visited node type.
	* @template {UnistParent} [Ancestor=UnistParent]
	*   Ancestor type.
	*/
	/**
	* @typedef {Visitor<Visited, Parent<Ancestor, Visited>>} BuildVisitorFromMatch
	*   Build a typed `Visitor` function from a node and all possible parents.
	*
	*   It will infer which values are passed as `node` and which as `parent`.
	* @template {UnistNode} Visited
	*   Node type.
	* @template {UnistParent} Ancestor
	*   Parent type.
	*/
	/**
	* @typedef {(
	*   BuildVisitorFromMatch<
	*     Matches<Descendant, Check>,
	*     Extract<Descendant, UnistParent>
	*   >
	* )} BuildVisitorFromDescendants
	*   Build a typed `Visitor` function from a list of descendants and a test.
	*
	*   It will infer which values are passed as `node` and which as `parent`.
	* @template {UnistNode} Descendant
	*   Node type.
	* @template {Test} Check
	*   Test type.
	*/
	/**
	* @typedef {(
	*   BuildVisitorFromDescendants<
	*     InclusiveDescendant<Tree>,
	*     Check
	*   >
	* )} BuildVisitor
	*   Build a typed `Visitor` function from a tree and a test.
	*
	*   It will infer which values are passed as `node` and which as `parent`.
	* @template {UnistNode} [Tree=UnistNode]
	*   Node type.
	* @template {Test} [Check=Test]
	*   Test type.
	*/
	/**
	* Visit nodes.
	*
	* This algorithm performs *depth-first* *tree traversal* in *preorder*
	* (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
	*
	* You can choose for which nodes `visitor` is called by passing a `test`.
	* For complex tests, you should test yourself in `visitor`, as it will be
	* faster and will have improved type information.
	*
	* Walking the tree is an intensive task.
	* Make use of the return values of the visitor when possible.
	* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
	* to check if a node matches, and then perform different operations.
	*
	* You can change the tree.
	* See `Visitor` for more info.
	*
	* @overload
	* @param {Tree} tree
	* @param {Check} check
	* @param {BuildVisitor<Tree, Check>} visitor
	* @param {boolean | null | undefined} [reverse]
	* @returns {undefined}
	*
	* @overload
	* @param {Tree} tree
	* @param {BuildVisitor<Tree>} visitor
	* @param {boolean | null | undefined} [reverse]
	* @returns {undefined}
	*
	* @param {UnistNode} tree
	*   Tree to traverse.
	* @param {Visitor | Test} testOrVisitor
	*   `unist-util-is`-compatible test (optional, omit to pass a visitor).
	* @param {Visitor | boolean | null | undefined} [visitorOrReverse]
	*   Handle each node (when test is omitted, pass `reverse`).
	* @param {boolean | null | undefined} [maybeReverse=false]
	*   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
	* @returns {undefined}
	*   Nothing.
	*
	* @template {UnistNode} Tree
	*   Node type.
	* @template {Test} Check
	*   `unist-util-is`-compatible test.
	*/
	function visit$1(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
		/** @type {boolean | null | undefined} */
		let reverse;
		/** @type {Test} */
		let test;
		/** @type {Visitor} */
		let visitor;
		if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
			test = void 0;
			visitor = testOrVisitor;
			reverse = visitorOrReverse;
		} else {
			test = testOrVisitor;
			visitor = visitorOrReverse;
			reverse = maybeReverse;
		}
		visitParents$1(tree, test, overload, reverse);
		/**
		* @param {UnistNode} node
		* @param {Array<UnistParent>} parents
		*/
		function overload(node, parents) {
			const parent = parents[parents.length - 1];
			const index = parent ? parent.children.indexOf(node) : void 0;
			return visitor(node, index, parent);
		}
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js
	/**
	* @import {State} from 'mdast-util-to-markdown'
	* @import {Heading} from 'mdast'
	*/
	/**
	* @param {Heading} node
	* @param {State} state
	* @returns {boolean}
	*/
	function formatHeadingAsSetext$1(node, state) {
		let literalWithBreak = false;
		visit$1(node, function(node) {
			if ("value" in node && /\r?\n|\r/.test(node.value) || node.type === "break") {
				literalWithBreak = true;
				return false;
			}
		});
		return Boolean((!node.depth || node.depth < 3) && toString$1(node) && (state.options.setext || literalWithBreak));
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/heading.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {Heading, Parents} from 'mdast'
	*/
	/**
	* @param {Heading} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function heading$1(node, _, state, info) {
		const rank = Math.max(Math.min(6, node.depth || 1), 1);
		const tracker = state.createTracker(info);
		if (formatHeadingAsSetext$1(node, state)) {
			const exit = state.enter("headingSetext");
			const subexit = state.enter("phrasing");
			const value = state.containerPhrasing(node, {
				...tracker.current(),
				before: "\n",
				after: "\n"
			});
			subexit();
			exit();
			return value + "\n" + (rank === 1 ? "=" : "-").repeat(value.length - (Math.max(value.lastIndexOf("\r"), value.lastIndexOf("\n")) + 1));
		}
		const sequence = "#".repeat(rank);
		const exit = state.enter("headingAtx");
		const subexit = state.enter("phrasing");
		tracker.move(sequence + " ");
		let value = state.containerPhrasing(node, {
			before: "# ",
			after: "\n",
			...tracker.current()
		});
		if (/^[\t ]/.test(value)) value = encodeCharacterReference$1(value.charCodeAt(0)) + value.slice(1);
		value = value ? sequence + " " + value : sequence;
		if (state.options.closeAtx) value += " " + sequence;
		subexit();
		exit();
		return value;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/html.js
	/**
	* @import {Html} from 'mdast'
	*/
	html$1.peek = htmlPeek$1;
	/**
	* @param {Html} node
	* @returns {string}
	*/
	function html$1(node) {
		return node.value || "";
	}
	/**
	* @returns {string}
	*/
	function htmlPeek$1() {
		return "<";
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/image.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {Image, Parents} from 'mdast'
	*/
	image$1.peek = imagePeek$1;
	/**
	* @param {Image} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function image$1(node, _, state, info) {
		const quote = checkQuote$1(state);
		const suffix = quote === "\"" ? "Quote" : "Apostrophe";
		const exit = state.enter("image");
		let subexit = state.enter("label");
		const tracker = state.createTracker(info);
		let value = tracker.move("![");
		value += tracker.move(state.safe(node.alt, {
			before: value,
			after: "]",
			...tracker.current()
		}));
		value += tracker.move("](");
		subexit();
		if (!node.url && node.title || /[\0- \u007F]/.test(node.url)) {
			subexit = state.enter("destinationLiteral");
			value += tracker.move("<");
			value += tracker.move(state.safe(node.url, {
				before: value,
				after: ">",
				...tracker.current()
			}));
			value += tracker.move(">");
		} else {
			subexit = state.enter("destinationRaw");
			value += tracker.move(state.safe(node.url, {
				before: value,
				after: node.title ? " " : ")",
				...tracker.current()
			}));
		}
		subexit();
		if (node.title) {
			subexit = state.enter(`title${suffix}`);
			value += tracker.move(" " + quote);
			value += tracker.move(state.safe(node.title, {
				before: value,
				after: quote,
				...tracker.current()
			}));
			value += tracker.move(quote);
			subexit();
		}
		value += tracker.move(")");
		exit();
		return value;
	}
	/**
	* @returns {string}
	*/
	function imagePeek$1() {
		return "!";
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/image-reference.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {ImageReference, Parents} from 'mdast'
	*/
	imageReference$1.peek = imageReferencePeek$1;
	/**
	* @param {ImageReference} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function imageReference$1(node, _, state, info) {
		const type = node.referenceType;
		const exit = state.enter("imageReference");
		let subexit = state.enter("label");
		const tracker = state.createTracker(info);
		let value = tracker.move("![");
		const alt = state.safe(node.alt, {
			before: value,
			after: "]",
			...tracker.current()
		});
		value += tracker.move(alt + "][");
		subexit();
		const stack = state.stack;
		state.stack = [];
		subexit = state.enter("reference");
		const reference = state.safe(state.associationId(node), {
			before: value,
			after: "]",
			...tracker.current()
		});
		subexit();
		state.stack = stack;
		exit();
		if (type === "full" || !alt || alt !== reference) value += tracker.move(reference + "]");
		else if (type === "shortcut") value = value.slice(0, -1);
		else value += tracker.move("]");
		return value;
	}
	/**
	* @returns {string}
	*/
	function imageReferencePeek$1() {
		return "!";
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/inline-code.js
	/**
	* @import {State} from 'mdast-util-to-markdown'
	* @import {InlineCode, Parents} from 'mdast'
	*/
	inlineCode$1.peek = inlineCodePeek$1;
	/**
	* @param {InlineCode} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @returns {string}
	*/
	function inlineCode$1(node, _, state) {
		let value = node.value || "";
		let sequence = "`";
		let index = -1;
		while (new RegExp("(^|[^`])" + sequence + "([^`]|$)").test(value)) sequence += "`";
		if (/[^ \r\n]/.test(value) && (/^[ \r\n]/.test(value) && /[ \r\n]$/.test(value) || /^`|`$/.test(value))) value = " " + value + " ";
		while (++index < state.unsafe.length) {
			const pattern = state.unsafe[index];
			const expression = state.compilePattern(pattern);
			/** @type {RegExpExecArray | null} */
			let match;
			if (!pattern.atBreak) continue;
			while (match = expression.exec(value)) {
				let position = match.index;
				if (value.charCodeAt(position) === 10 && value.charCodeAt(position - 1) === 13) position--;
				value = value.slice(0, position) + " " + value.slice(match.index + 1);
			}
		}
		return sequence + value + sequence;
	}
	/**
	* @returns {string}
	*/
	function inlineCodePeek$1() {
		return "`";
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/format-link-as-autolink.js
	/**
	* @import {State} from 'mdast-util-to-markdown'
	* @import {Link} from 'mdast'
	*/
	/**
	* @param {Link} node
	* @param {State} state
	* @returns {boolean}
	*/
	function formatLinkAsAutolink$1(node, state) {
		const raw = toString$1(node);
		return Boolean(!state.options.resourceLink && node.url && !node.title && node.children && node.children.length === 1 && node.children[0].type === "text" && (raw === node.url || "mailto:" + raw === node.url) && /^[a-z][a-z+.-]+:/i.test(node.url) && !/[\0- <>\u007F]/.test(node.url));
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/link.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {Link, Parents} from 'mdast'
	* @import {Exit} from '../types.js'
	*/
	link$1.peek = linkPeek$1;
	/**
	* @param {Link} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function link$1(node, _, state, info) {
		const quote = checkQuote$1(state);
		const suffix = quote === "\"" ? "Quote" : "Apostrophe";
		const tracker = state.createTracker(info);
		/** @type {Exit} */
		let exit;
		/** @type {Exit} */
		let subexit;
		if (formatLinkAsAutolink$1(node, state)) {
			const stack = state.stack;
			state.stack = [];
			exit = state.enter("autolink");
			let value = tracker.move("<");
			value += tracker.move(state.containerPhrasing(node, {
				before: value,
				after: ">",
				...tracker.current()
			}));
			value += tracker.move(">");
			exit();
			state.stack = stack;
			return value;
		}
		exit = state.enter("link");
		subexit = state.enter("label");
		let value = tracker.move("[");
		value += tracker.move(state.containerPhrasing(node, {
			before: value,
			after: "](",
			...tracker.current()
		}));
		value += tracker.move("](");
		subexit();
		if (!node.url && node.title || /[\0- \u007F]/.test(node.url)) {
			subexit = state.enter("destinationLiteral");
			value += tracker.move("<");
			value += tracker.move(state.safe(node.url, {
				before: value,
				after: ">",
				...tracker.current()
			}));
			value += tracker.move(">");
		} else {
			subexit = state.enter("destinationRaw");
			value += tracker.move(state.safe(node.url, {
				before: value,
				after: node.title ? " " : ")",
				...tracker.current()
			}));
		}
		subexit();
		if (node.title) {
			subexit = state.enter(`title${suffix}`);
			value += tracker.move(" " + quote);
			value += tracker.move(state.safe(node.title, {
				before: value,
				after: quote,
				...tracker.current()
			}));
			value += tracker.move(quote);
			subexit();
		}
		value += tracker.move(")");
		exit();
		return value;
	}
	/**
	* @param {Link} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @returns {string}
	*/
	function linkPeek$1(node, _, state) {
		return formatLinkAsAutolink$1(node, state) ? "<" : "[";
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/link-reference.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {LinkReference, Parents} from 'mdast'
	*/
	linkReference$1.peek = linkReferencePeek$1;
	/**
	* @param {LinkReference} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function linkReference$1(node, _, state, info) {
		const type = node.referenceType;
		const exit = state.enter("linkReference");
		let subexit = state.enter("label");
		const tracker = state.createTracker(info);
		let value = tracker.move("[");
		const text = state.containerPhrasing(node, {
			before: value,
			after: "]",
			...tracker.current()
		});
		value += tracker.move(text + "][");
		subexit();
		const stack = state.stack;
		state.stack = [];
		subexit = state.enter("reference");
		const reference = state.safe(state.associationId(node), {
			before: value,
			after: "]",
			...tracker.current()
		});
		subexit();
		state.stack = stack;
		exit();
		if (type === "full" || !text || text !== reference) value += tracker.move(reference + "]");
		else if (type === "shortcut") value = value.slice(0, -1);
		else value += tracker.move("]");
		return value;
	}
	/**
	* @returns {string}
	*/
	function linkReferencePeek$1() {
		return "[";
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['bullet'], null | undefined>}
	*/
	function checkBullet$1(state) {
		const marker = state.options.bullet || "*";
		if (marker !== "*" && marker !== "+" && marker !== "-") throw new Error("Cannot serialize items with `" + marker + "` for `options.bullet`, expected `*`, `+`, or `-`");
		return marker;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-other.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['bullet'], null | undefined>}
	*/
	function checkBulletOther$1(state) {
		const bullet = checkBullet$1(state);
		const bulletOther = state.options.bulletOther;
		if (!bulletOther) return bullet === "*" ? "-" : "*";
		if (bulletOther !== "*" && bulletOther !== "+" && bulletOther !== "-") throw new Error("Cannot serialize items with `" + bulletOther + "` for `options.bulletOther`, expected `*`, `+`, or `-`");
		if (bulletOther === bullet) throw new Error("Expected `bullet` (`" + bullet + "`) and `bulletOther` (`" + bulletOther + "`) to be different");
		return bulletOther;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-ordered.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['bulletOrdered'], null | undefined>}
	*/
	function checkBulletOrdered$1(state) {
		const marker = state.options.bulletOrdered || ".";
		if (marker !== "." && marker !== ")") throw new Error("Cannot serialize items with `" + marker + "` for `options.bulletOrdered`, expected `.` or `)`");
		return marker;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-rule.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['rule'], null | undefined>}
	*/
	function checkRule$1(state) {
		const marker = state.options.rule || "*";
		if (marker !== "*" && marker !== "-" && marker !== "_") throw new Error("Cannot serialize rules with `" + marker + "` for `options.rule`, expected `*`, `-`, or `_`");
		return marker;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/list.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {List, Parents} from 'mdast'
	*/
	/**
	* @param {List} node
	* @param {Parents | undefined} parent
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function list$1(node, parent, state, info) {
		const exit = state.enter("list");
		const bulletCurrent = state.bulletCurrent;
		/** @type {string} */
		let bullet = node.ordered ? checkBulletOrdered$1(state) : checkBullet$1(state);
		/** @type {string} */
		const bulletOther = node.ordered ? bullet === "." ? ")" : "." : checkBulletOther$1(state);
		let useDifferentMarker = parent && state.bulletLastUsed ? bullet === state.bulletLastUsed : false;
		if (!node.ordered) {
			const firstListItem = node.children ? node.children[0] : void 0;
			if ((bullet === "*" || bullet === "-") && firstListItem && (!firstListItem.children || !firstListItem.children[0]) && state.stack[state.stack.length - 1] === "list" && state.stack[state.stack.length - 2] === "listItem" && state.stack[state.stack.length - 3] === "list" && state.stack[state.stack.length - 4] === "listItem" && state.indexStack[state.indexStack.length - 1] === 0 && state.indexStack[state.indexStack.length - 2] === 0 && state.indexStack[state.indexStack.length - 3] === 0) useDifferentMarker = true;
			if (checkRule$1(state) === bullet && firstListItem) {
				let index = -1;
				while (++index < node.children.length) {
					const item = node.children[index];
					if (item && item.type === "listItem" && item.children && item.children[0] && item.children[0].type === "thematicBreak") {
						useDifferentMarker = true;
						break;
					}
				}
			}
		}
		if (useDifferentMarker) bullet = bulletOther;
		state.bulletCurrent = bullet;
		const value = state.containerFlow(node, info);
		state.bulletLastUsed = bullet;
		state.bulletCurrent = bulletCurrent;
		exit();
		return value;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-list-item-indent.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['listItemIndent'], null | undefined>}
	*/
	function checkListItemIndent$1(state) {
		const style = state.options.listItemIndent || "one";
		if (style !== "tab" && style !== "one" && style !== "mixed") throw new Error("Cannot serialize items with `" + style + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");
		return style;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/list-item.js
	/**
	* @import {Info, Map, State} from 'mdast-util-to-markdown'
	* @import {ListItem, Parents} from 'mdast'
	*/
	/**
	* @param {ListItem} node
	* @param {Parents | undefined} parent
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function listItem$1(node, parent, state, info) {
		const listItemIndent = checkListItemIndent$1(state);
		let bullet = state.bulletCurrent || checkBullet$1(state);
		if (parent && parent.type === "list" && parent.ordered) bullet = (typeof parent.start === "number" && parent.start > -1 ? parent.start : 1) + (state.options.incrementListMarker === false ? 0 : parent.children.indexOf(node)) + bullet;
		let size = bullet.length + 1;
		if (listItemIndent === "tab" || listItemIndent === "mixed" && (parent && parent.type === "list" && parent.spread || node.spread)) size = Math.ceil(size / 4) * 4;
		const tracker = state.createTracker(info);
		tracker.move(bullet + " ".repeat(size - bullet.length));
		tracker.shift(size);
		const exit = state.enter("listItem");
		const value = state.indentLines(state.containerFlow(node, tracker.current()), map);
		exit();
		return value;
		/** @type {Map} */
		function map(line, index, blank) {
			if (index) return (blank ? "" : " ".repeat(size)) + line;
			return (blank ? bullet : bullet + " ".repeat(size - bullet.length)) + line;
		}
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/paragraph.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {Paragraph, Parents} from 'mdast'
	*/
	/**
	* @param {Paragraph} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function paragraph$1(node, _, state, info) {
		const exit = state.enter("paragraph");
		const subexit = state.enter("phrasing");
		const value = state.containerPhrasing(node, info);
		subexit();
		exit();
		return value;
	}
	//#endregion
	//#region node_modules/mdast-util-phrasing/lib/index.js
	/**
	* @typedef {import('mdast').Html} Html
	* @typedef {import('mdast').PhrasingContent} PhrasingContent
	*/
	/**
	* Check if the given value is *phrasing content*.
	*
	* > 👉 **Note**: Excludes `html`, which can be both phrasing or flow.
	*
	* @param node
	*   Thing to check, typically `Node`.
	* @returns
	*   Whether `value` is phrasing content.
	*/
	var phrasing$1 = convert$1([
		"break",
		"delete",
		"emphasis",
		"footnote",
		"footnoteReference",
		"image",
		"imageReference",
		"inlineCode",
		"inlineMath",
		"link",
		"linkReference",
		"mdxJsxTextElement",
		"mdxTextExpression",
		"strong",
		"text",
		"textDirective"
	]);
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/root.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {Parents, Root} from 'mdast'
	*/
	/**
	* @param {Root} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function root$1(node, _, state, info) {
		return (node.children.some(function(d) {
			return phrasing$1(d);
		}) ? state.containerPhrasing : state.containerFlow).call(state, node, info);
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-strong.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['strong'], null | undefined>}
	*/
	function checkStrong$1(state) {
		const marker = state.options.strong || "*";
		if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize strong with `" + marker + "` for `options.strong`, expected `*`, or `_`");
		return marker;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/strong.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {Parents, Strong} from 'mdast'
	*/
	strong$1.peek = strongPeek$1;
	/**
	* @param {Strong} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function strong$1(node, _, state, info) {
		const marker = checkStrong$1(state);
		const exit = state.enter("strong");
		const tracker = state.createTracker(info);
		const before = tracker.move(marker + marker);
		let between = tracker.move(state.containerPhrasing(node, {
			after: marker,
			before,
			...tracker.current()
		}));
		const betweenHead = between.charCodeAt(0);
		const open = encodeInfo$1(info.before.charCodeAt(info.before.length - 1), betweenHead, marker);
		if (open.inside) between = encodeCharacterReference$1(betweenHead) + between.slice(1);
		const betweenTail = between.charCodeAt(between.length - 1);
		const close = encodeInfo$1(info.after.charCodeAt(0), betweenTail, marker);
		if (close.inside) between = between.slice(0, -1) + encodeCharacterReference$1(betweenTail);
		const after = tracker.move(marker + marker);
		exit();
		state.attentionEncodeSurroundingInfo = {
			after: close.outside,
			before: open.outside
		};
		return before + between + after;
	}
	/**
	* @param {Strong} _
	* @param {Parents | undefined} _1
	* @param {State} state
	* @returns {string}
	*/
	function strongPeek$1(_, _1, state) {
		return state.options.strong || "*";
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/text.js
	/**
	* @import {Info, State} from 'mdast-util-to-markdown'
	* @import {Parents, Text} from 'mdast'
	*/
	/**
	* @param {Text} node
	* @param {Parents | undefined} _
	* @param {State} state
	* @param {Info} info
	* @returns {string}
	*/
	function text$2(node, _, state, info) {
		return state.safe(node.value, info);
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/check-rule-repetition.js
	/**
	* @import {Options, State} from 'mdast-util-to-markdown'
	*/
	/**
	* @param {State} state
	* @returns {Exclude<Options['ruleRepetition'], null | undefined>}
	*/
	function checkRuleRepetition$1(state) {
		const repetition = state.options.ruleRepetition || 3;
		if (repetition < 3) throw new Error("Cannot serialize rules with repetition `" + repetition + "` for `options.ruleRepetition`, expected `3` or more");
		return repetition;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js
	/**
	* @import {State} from 'mdast-util-to-markdown'
	* @import {Parents, ThematicBreak} from 'mdast'
	*/
	/**
	* @param {ThematicBreak} _
	* @param {Parents | undefined} _1
	* @param {State} state
	* @returns {string}
	*/
	function thematicBreak$1(_, _1, state) {
		const value = (checkRule$1(state) + (state.options.ruleSpaces ? " " : "")).repeat(checkRuleRepetition$1(state));
		return state.options.ruleSpaces ? value.slice(0, -1) : value;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/handle/index.js
	/**
	* Default (CommonMark) handlers.
	*/
	var handle$1 = {
		blockquote: blockquote$1,
		break: hardBreak$1,
		code: code$2,
		definition: definition$1,
		emphasis: emphasis$1,
		hardBreak: hardBreak$1,
		heading: heading$1,
		html: html$1,
		image: image$1,
		imageReference: imageReference$1,
		inlineCode: inlineCode$1,
		link: link$1,
		linkReference: linkReference$1,
		list: list$1,
		listItem: listItem$1,
		paragraph: paragraph$1,
		root: root$1,
		strong: strong$1,
		text: text$2,
		thematicBreak: thematicBreak$1
	};
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/join.js
	/**
	* @import {Join} from 'mdast-util-to-markdown'
	*/
	/** @type {Array<Join>} */
	var join = [joinDefaults];
	/** @type {Join} */
	function joinDefaults(left, right, parent, state) {
		if (right.type === "code" && formatCodeAsIndented$1(right, state) && (left.type === "list" || left.type === right.type && formatCodeAsIndented$1(left, state))) return false;
		if ("spread" in parent && typeof parent.spread === "boolean") {
			if (left.type === "paragraph" && (left.type === right.type || right.type === "definition" || right.type === "heading" && formatHeadingAsSetext$1(right, state))) return;
			return parent.spread ? 1 : 0;
		}
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/unsafe.js
	/**
	* @import {ConstructName, Unsafe} from 'mdast-util-to-markdown'
	*/
	/**
	* List of constructs that occur in phrasing (paragraphs, headings), but cannot
	* contain things like attention (emphasis, strong), images, or links.
	* So they sort of cancel each other out.
	* Note: could use a better name.
	*
	* @type {Array<ConstructName>}
	*/
	var fullPhrasingSpans = [
		"autolink",
		"destinationLiteral",
		"destinationRaw",
		"reference",
		"titleQuote",
		"titleApostrophe"
	];
	/** @type {Array<Unsafe>} */
	var unsafe = [
		{
			character: "	",
			after: "[\\r\\n]",
			inConstruct: "phrasing"
		},
		{
			character: "	",
			before: "[\\r\\n]",
			inConstruct: "phrasing"
		},
		{
			character: "	",
			inConstruct: ["codeFencedLangGraveAccent", "codeFencedLangTilde"]
		},
		{
			character: "\r",
			inConstruct: [
				"codeFencedLangGraveAccent",
				"codeFencedLangTilde",
				"codeFencedMetaGraveAccent",
				"codeFencedMetaTilde",
				"destinationLiteral",
				"headingAtx"
			]
		},
		{
			character: "\n",
			inConstruct: [
				"codeFencedLangGraveAccent",
				"codeFencedLangTilde",
				"codeFencedMetaGraveAccent",
				"codeFencedMetaTilde",
				"destinationLiteral",
				"headingAtx"
			]
		},
		{
			character: " ",
			after: "[\\r\\n]",
			inConstruct: "phrasing"
		},
		{
			character: " ",
			before: "[\\r\\n]",
			inConstruct: "phrasing"
		},
		{
			character: " ",
			inConstruct: ["codeFencedLangGraveAccent", "codeFencedLangTilde"]
		},
		{
			character: "!",
			after: "\\[",
			inConstruct: "phrasing",
			notInConstruct: fullPhrasingSpans
		},
		{
			character: "\"",
			inConstruct: "titleQuote"
		},
		{
			atBreak: true,
			character: "#"
		},
		{
			character: "#",
			inConstruct: "headingAtx",
			after: "(?:[\r\n]|$)"
		},
		{
			character: "&",
			after: "[#A-Za-z]",
			inConstruct: "phrasing"
		},
		{
			character: "'",
			inConstruct: "titleApostrophe"
		},
		{
			character: "(",
			inConstruct: "destinationRaw"
		},
		{
			before: "\\]",
			character: "(",
			inConstruct: "phrasing",
			notInConstruct: fullPhrasingSpans
		},
		{
			atBreak: true,
			before: "\\d+",
			character: ")"
		},
		{
			character: ")",
			inConstruct: "destinationRaw"
		},
		{
			atBreak: true,
			character: "*",
			after: "(?:[ 	\r\n*])"
		},
		{
			character: "*",
			inConstruct: "phrasing",
			notInConstruct: fullPhrasingSpans
		},
		{
			atBreak: true,
			character: "+",
			after: "(?:[ 	\r\n])"
		},
		{
			atBreak: true,
			character: "-",
			after: "(?:[ 	\r\n-])"
		},
		{
			atBreak: true,
			before: "\\d+",
			character: ".",
			after: "(?:[ 	\r\n]|$)"
		},
		{
			atBreak: true,
			character: "<",
			after: "[!/?A-Za-z]"
		},
		{
			character: "<",
			after: "[!/?A-Za-z]",
			inConstruct: "phrasing",
			notInConstruct: fullPhrasingSpans
		},
		{
			character: "<",
			inConstruct: "destinationLiteral"
		},
		{
			atBreak: true,
			character: "="
		},
		{
			atBreak: true,
			character: ">"
		},
		{
			character: ">",
			inConstruct: "destinationLiteral"
		},
		{
			atBreak: true,
			character: "["
		},
		{
			character: "[",
			inConstruct: "phrasing",
			notInConstruct: fullPhrasingSpans
		},
		{
			character: "[",
			inConstruct: ["label", "reference"]
		},
		{
			character: "\\",
			after: "[\\r\\n]",
			inConstruct: "phrasing"
		},
		{
			character: "]",
			inConstruct: ["label", "reference"]
		},
		{
			atBreak: true,
			character: "_"
		},
		{
			character: "_",
			inConstruct: "phrasing",
			notInConstruct: fullPhrasingSpans
		},
		{
			atBreak: true,
			character: "`"
		},
		{
			character: "`",
			inConstruct: ["codeFencedLangGraveAccent", "codeFencedMetaGraveAccent"]
		},
		{
			character: "`",
			inConstruct: "phrasing",
			notInConstruct: fullPhrasingSpans
		},
		{
			atBreak: true,
			character: "~"
		}
	];
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/association.js
	/**
	* @import {AssociationId} from '../types.js'
	*/
	/**
	* Get an identifier from an association to match it to others.
	*
	* Associations are nodes that match to something else through an ID:
	* <https://github.com/syntax-tree/mdast#association>.
	*
	* The `label` of an association is the string value: character escapes and
	* references work, and casing is intact.
	* The `identifier` is used to match one association to another:
	* controversially, character escapes and references don’t work in this
	* matching: `&copy;` does not match `©`, and `\+` does not match `+`.
	*
	* But casing is ignored (and whitespace) is trimmed and collapsed: ` A\nb`
	* matches `a b`.
	* So, we do prefer the label when figuring out how we’re going to serialize:
	* it has whitespace, casing, and we can ignore most useless character
	* escapes and all character references.
	*
	* @type {AssociationId}
	*/
	function association(node) {
		if (node.label || !node.identifier) return node.label || "";
		return decodeString(node.identifier);
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/compile-pattern.js
	/**
	* @import {CompilePattern} from '../types.js'
	*/
	/**
	* @type {CompilePattern}
	*/
	function compilePattern(pattern) {
		if (!pattern._compiled) {
			const before = (pattern.atBreak ? "[\\r\\n][\\t ]*" : "") + (pattern.before ? "(?:" + pattern.before + ")" : "");
			pattern._compiled = new RegExp((before ? "(" + before + ")" : "") + (/[|\\{}()[\]^$+*?.-]/.test(pattern.character) ? "\\" : "") + pattern.character + (pattern.after ? "(?:" + pattern.after + ")" : ""), "g");
		}
		return pattern._compiled;
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/container-phrasing.js
	/**
	* @import {Handle, Info, State} from 'mdast-util-to-markdown'
	* @import {PhrasingParents} from '../types.js'
	*/
	/**
	* Serialize the children of a parent that contains phrasing children.
	*
	* These children will be joined flush together.
	*
	* @param {PhrasingParents} parent
	*   Parent of flow nodes.
	* @param {State} state
	*   Info passed around about the current state.
	* @param {Info} info
	*   Info on where we are in the document we are generating.
	* @returns {string}
	*   Serialized children, joined together.
	*/
	function containerPhrasing(parent, state, info) {
		const indexStack = state.indexStack;
		const children = parent.children || [];
		/** @type {Array<string>} */
		const results = [];
		let index = -1;
		let before = info.before;
		/** @type {string | undefined} */
		let encodeAfter;
		indexStack.push(-1);
		let tracker = state.createTracker(info);
		while (++index < children.length) {
			const child = children[index];
			/** @type {string} */
			let after;
			indexStack[indexStack.length - 1] = index;
			if (index + 1 < children.length) {
				/** @type {Handle} */
				let handle = state.handle.handlers[children[index + 1].type];
				/** @type {Handle} */
				if (handle && handle.peek) handle = handle.peek;
				after = handle ? handle(children[index + 1], parent, state, {
					before: "",
					after: "",
					...tracker.current()
				}).charAt(0) : "";
			} else after = info.after;
			if (results.length > 0 && (before === "\r" || before === "\n") && child.type === "html") {
				results[results.length - 1] = results[results.length - 1].replace(/(\r?\n|\r)$/, " ");
				before = " ";
				tracker = state.createTracker(info);
				tracker.move(results.join(""));
			}
			let value = state.handle(child, parent, state, {
				...tracker.current(),
				after,
				before
			});
			if (encodeAfter && encodeAfter === value.slice(0, 1)) value = encodeCharacterReference$1(encodeAfter.charCodeAt(0)) + value.slice(1);
			const encodingInfo = state.attentionEncodeSurroundingInfo;
			state.attentionEncodeSurroundingInfo = void 0;
			encodeAfter = void 0;
			if (encodingInfo) {
				if (results.length > 0 && encodingInfo.before && before === results[results.length - 1].slice(-1)) results[results.length - 1] = results[results.length - 1].slice(0, -1) + encodeCharacterReference$1(before.charCodeAt(0));
				if (encodingInfo.after) encodeAfter = after;
			}
			tracker.move(value);
			results.push(value);
			before = value.slice(-1);
		}
		indexStack.pop();
		return results.join("");
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/container-flow.js
	/**
	* @import {State} from 'mdast-util-to-markdown'
	* @import {FlowChildren, FlowParents, TrackFields} from '../types.js'
	*/
	/**
	* @param {FlowParents} parent
	*   Parent of flow nodes.
	* @param {State} state
	*   Info passed around about the current state.
	* @param {TrackFields} info
	*   Info on where we are in the document we are generating.
	* @returns {string}
	*   Serialized children, joined by (blank) lines.
	*/
	function containerFlow(parent, state, info) {
		const indexStack = state.indexStack;
		const children = parent.children || [];
		const tracker = state.createTracker(info);
		/** @type {Array<string>} */
		const results = [];
		let index = -1;
		indexStack.push(-1);
		while (++index < children.length) {
			const child = children[index];
			indexStack[indexStack.length - 1] = index;
			results.push(tracker.move(state.handle(child, parent, state, {
				before: "\n",
				after: "\n",
				...tracker.current()
			})));
			if (child.type !== "list") state.bulletLastUsed = void 0;
			if (index < children.length - 1) results.push(tracker.move(between(child, children[index + 1], parent, state)));
		}
		indexStack.pop();
		return results.join("");
	}
	/**
	* @param {FlowChildren} left
	* @param {FlowChildren} right
	* @param {FlowParents} parent
	* @param {State} state
	* @returns {string}
	*/
	function between(left, right, parent, state) {
		let index = state.join.length;
		while (index--) {
			const result = state.join[index](left, right, parent, state);
			if (result === true || result === 1) break;
			if (typeof result === "number") return "\n".repeat(1 + result);
			if (result === false) return "\n\n<!---->\n\n";
		}
		return "\n\n";
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/indent-lines.js
	/**
	* @import {IndentLines} from '../types.js'
	*/
	var eol = /\r?\n|\r/g;
	/**
	* @type {IndentLines}
	*/
	function indentLines(value, map) {
		/** @type {Array<string>} */
		const result = [];
		let start = 0;
		let line = 0;
		/** @type {RegExpExecArray | null} */
		let match;
		while (match = eol.exec(value)) {
			one(value.slice(start, match.index));
			result.push(match[0]);
			start = match.index + match[0].length;
			line++;
		}
		one(value.slice(start));
		return result.join("");
		/**
		* @param {string} value
		*/
		function one(value) {
			result.push(map(value, line, !value));
		}
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/safe.js
	/**
	* @import {SafeConfig, State} from 'mdast-util-to-markdown'
	*/
	/**
	* Make a string safe for embedding in markdown constructs.
	*
	* In markdown, almost all punctuation characters can, in certain cases,
	* result in something.
	* Whether they do is highly subjective to where they happen and in what
	* they happen.
	*
	* To solve this, `mdast-util-to-markdown` tracks:
	*
	* * Characters before and after something;
	* * What “constructs” we are in.
	*
	* This information is then used by this function to escape or encode
	* special characters.
	*
	* @param {State} state
	*   Info passed around about the current state.
	* @param {string | null | undefined} input
	*   Raw value to make safe.
	* @param {SafeConfig} config
	*   Configuration.
	* @returns {string}
	*   Serialized markdown safe for embedding.
	*/
	function safe(state, input, config) {
		const value = (config.before || "") + (input || "") + (config.after || "");
		/** @type {Array<number>} */
		const positions = [];
		/** @type {Array<string>} */
		const result = [];
		/** @type {Record<number, {before: boolean, after: boolean}>} */
		const infos = {};
		let index = -1;
		while (++index < state.unsafe.length) {
			const pattern = state.unsafe[index];
			if (!patternInScope$1(state.stack, pattern)) continue;
			const expression = state.compilePattern(pattern);
			/** @type {RegExpExecArray | null} */
			let match;
			while (match = expression.exec(value)) {
				const before = "before" in pattern || Boolean(pattern.atBreak);
				const after = "after" in pattern;
				const position = match.index + (before ? match[1].length : 0);
				if (positions.includes(position)) {
					if (infos[position].before && !before) infos[position].before = false;
					if (infos[position].after && !after) infos[position].after = false;
				} else {
					positions.push(position);
					infos[position] = {
						before,
						after
					};
				}
			}
		}
		positions.sort(numerical);
		let start = config.before ? config.before.length : 0;
		const end = value.length - (config.after ? config.after.length : 0);
		index = -1;
		while (++index < positions.length) {
			const position = positions[index];
			if (position < start || position >= end) continue;
			if (position + 1 < end && positions[index + 1] === position + 1 && infos[position].after && !infos[position + 1].before && !infos[position + 1].after || positions[index - 1] === position - 1 && infos[position].before && !infos[position - 1].before && !infos[position - 1].after) continue;
			if (start !== position) result.push(escapeBackslashes(value.slice(start, position), "\\"));
			start = position;
			if (/[!-/:-@[-`{-~]/.test(value.charAt(position)) && (!config.encode || !config.encode.includes(value.charAt(position)))) result.push("\\");
			else {
				result.push(encodeCharacterReference$1(value.charCodeAt(position)));
				start++;
			}
		}
		result.push(escapeBackslashes(value.slice(start, end), config.after));
		return result.join("");
	}
	/**
	* @param {number} a
	* @param {number} b
	* @returns {number}
	*/
	function numerical(a, b) {
		return a - b;
	}
	/**
	* @param {string} value
	* @param {string} after
	* @returns {string}
	*/
	function escapeBackslashes(value, after) {
		const expression = /\\(?=[!-/:-@[-`{-~])/g;
		/** @type {Array<number>} */
		const positions = [];
		/** @type {Array<string>} */
		const results = [];
		const whole = value + after;
		let index = -1;
		let start = 0;
		/** @type {RegExpExecArray | null} */
		let match;
		while (match = expression.exec(whole)) positions.push(match.index);
		while (++index < positions.length) {
			if (start !== positions[index]) results.push(value.slice(start, positions[index]));
			results.push("\\");
			start = positions[index];
		}
		results.push(value.slice(start));
		return results.join("");
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/util/track.js
	/**
	* @import {CreateTracker, TrackCurrent, TrackMove, TrackShift} from '../types.js'
	*/
	/**
	* Track positional info in the output.
	*
	* @type {CreateTracker}
	*/
	function track(config) {
		/* c8 ignore next 5 */
		const options = config || {};
		const now = options.now || {};
		let lineShift = options.lineShift || 0;
		let line = now.line || 1;
		let column = now.column || 1;
		return {
			move,
			current,
			shift
		};
		/**
		* Get the current tracked info.
		*
		* @type {TrackCurrent}
		*/
		function current() {
			return {
				now: {
					line,
					column
				},
				lineShift
			};
		}
		/**
		* Define an increased line shift (the typical indent for lines).
		*
		* @type {TrackShift}
		*/
		function shift(value) {
			lineShift += value;
		}
		/**
		* Move past some generated markdown.
		*
		* @type {TrackMove}
		*/
		function move(input) {
			const value = input || "";
			const chunks = value.split(/\r?\n|\r/g);
			const tail = chunks[chunks.length - 1];
			line += chunks.length - 1;
			column = chunks.length === 1 ? column + tail.length : 1 + tail.length + lineShift;
			return value;
		}
	}
	//#endregion
	//#region node_modules/mdast-util-to-markdown/lib/index.js
	/**
	* @import {Info, Join, Options, SafeConfig, State} from 'mdast-util-to-markdown'
	* @import {Nodes} from 'mdast'
	* @import {Enter, FlowParents, PhrasingParents, TrackFields} from './types.js'
	*/
	/**
	* Turn an mdast syntax tree into markdown.
	*
	* @param {Nodes} tree
	*   Tree to serialize.
	* @param {Options | null | undefined} [options]
	*   Configuration (optional).
	* @returns {string}
	*   Serialized markdown representing `tree`.
	*/
	function toMarkdown(tree, options) {
		const settings = options || {};
		/** @type {State} */
		const state = {
			associationId: association,
			containerPhrasing: containerPhrasingBound,
			containerFlow: containerFlowBound,
			createTracker: track,
			compilePattern,
			enter,
			handlers: { ...handle$1 },
			handle: void 0,
			indentLines,
			indexStack: [],
			join: [...join],
			options: {},
			safe: safeBound,
			stack: [],
			unsafe: [...unsafe]
		};
		configure(state, settings);
		if (state.options.tightDefinitions) state.join.push(joinDefinition);
		state.handle = zwitch("type", {
			invalid,
			unknown,
			handlers: state.handlers
		});
		let result = state.handle(tree, void 0, state, {
			before: "\n",
			after: "\n",
			now: {
				line: 1,
				column: 1
			},
			lineShift: 0
		});
		if (result && result.charCodeAt(result.length - 1) !== 10 && result.charCodeAt(result.length - 1) !== 13) result += "\n";
		return result;
		/** @type {Enter} */
		function enter(name) {
			state.stack.push(name);
			return exit;
			/**
			* @returns {undefined}
			*/
			function exit() {
				state.stack.pop();
			}
		}
	}
	/**
	* @param {unknown} value
	* @returns {never}
	*/
	function invalid(value) {
		throw new Error("Cannot handle value `" + value + "`, expected node");
	}
	/**
	* @param {unknown} value
	* @returns {never}
	*/
	function unknown(value) {
		throw new Error("Cannot handle unknown node `" + value.type + "`");
	}
	/** @type {Join} */
	function joinDefinition(left, right) {
		if (left.type === "definition" && left.type === right.type) return 0;
	}
	/**
	* Serialize the children of a parent that contains phrasing children.
	*
	* These children will be joined flush together.
	*
	* @this {State}
	*   Info passed around about the current state.
	* @param {PhrasingParents} parent
	*   Parent of flow nodes.
	* @param {Info} info
	*   Info on where we are in the document we are generating.
	* @returns {string}
	*   Serialized children, joined together.
	*/
	function containerPhrasingBound(parent, info) {
		return containerPhrasing(parent, this, info);
	}
	/**
	* Serialize the children of a parent that contains flow children.
	*
	* These children will typically be joined by blank lines.
	* What they are joined by exactly is defined by `Join` functions.
	*
	* @this {State}
	*   Info passed around about the current state.
	* @param {FlowParents} parent
	*   Parent of flow nodes.
	* @param {TrackFields} info
	*   Info on where we are in the document we are generating.
	* @returns {string}
	*   Serialized children, joined by (blank) lines.
	*/
	function containerFlowBound(parent, info) {
		return containerFlow(parent, this, info);
	}
	/**
	* Make a string safe for embedding in markdown constructs.
	*
	* In markdown, almost all punctuation characters can, in certain cases,
	* result in something.
	* Whether they do is highly subjective to where they happen and in what
	* they happen.
	*
	* To solve this, `mdast-util-to-markdown` tracks:
	*
	* * Characters before and after something;
	* * What “constructs” we are in.
	*
	* This information is then used by this function to escape or encode
	* special characters.
	*
	* @this {State}
	*   Info passed around about the current state.
	* @param {string | null | undefined} value
	*   Raw value to make safe.
	* @param {SafeConfig} config
	*   Configuration.
	* @returns {string}
	*   Serialized markdown safe for embedding.
	*/
	function safeBound(value, config) {
		return safe(this, value, config);
	}
	//#endregion
	//#region node_modules/remark-stringify/lib/index.js
	/**
	* @typedef {import('mdast').Root} Root
	* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownOptions
	* @typedef {import('unified').Compiler<Root, string>} Compiler
	* @typedef {import('unified').Processor<undefined, undefined, undefined, Root, string>} Processor
	*/
	/**
	* @typedef {Omit<ToMarkdownOptions, 'extensions'>} Options
	*/
	/**
	* Add support for serializing to markdown.
	*
	* @param {Readonly<Options> | null | undefined} [options]
	*   Configuration (optional).
	* @returns {undefined}
	*   Nothing.
	*/
	function remarkStringify(options) {
		/** @type {Processor} */
		const self = this;
		self.compiler = compiler;
		/**
		* @type {Compiler}
		*/
		function compiler(tree) {
			return toMarkdown(tree, {
				...self.data("settings"),
				...options,
				extensions: self.data("toMarkdownExtensions") || []
			});
		}
	}
	//#endregion
	//#region node_modules/prosemirror-remark/node_modules/prosemirror-inputrules/dist/index.js
	/**
	Input rules are regular expressions describing a piece of text
	that, when typed, causes something to happen. This might be
	changing two dashes into an emdash, wrapping a paragraph starting
	with `"> "` into a blockquote, or something entirely different.
	*/
	var InputRule = class {
		/**
		Create an input rule. The rule applies when the user typed
		something and the text directly in front of the cursor matches
		`match`, which should end with `$`.
		
		The `handler` can be a string, in which case the matched text, or
		the first matched group in the regexp, is replaced by that
		string.
		
		Or a it can be a function, which will be called with the match
		array produced by
		[`RegExp.exec`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec),
		as well as the start and end of the matched range, and which can
		return a [transaction](https://prosemirror.net/docs/ref/#state.Transaction) that describes the
		rule's effect, or null to indicate the input was not handled.
		*/
		constructor(match, handler, options = {}) {
			this.match = match;
			this.match = match;
			this.handler = typeof handler == "string" ? stringHandler(handler) : handler;
			this.undoable = options.undoable !== false;
			this.inCode = options.inCode || false;
			this.inCodeMark = options.inCodeMark !== false;
		}
	};
	function stringHandler(string) {
		return function(state, match, start, end) {
			let insert = string;
			if (match[1]) {
				let offset = match[0].lastIndexOf(match[1]);
				insert += match[0].slice(offset + match[1].length);
				start += offset;
				let cutOff = start - end;
				if (cutOff > 0) {
					insert = match[0].slice(offset - cutOff, offset) + insert;
					start = end;
				}
			}
			return state.tr.insertText(insert, start, end);
		};
	}
	new InputRule(/--$/, "—", { inCodeMark: false });
	new InputRule(/\.\.\.$/, "…", { inCodeMark: false });
	new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(")$/, "“", { inCodeMark: false });
	new InputRule(/"$/, "”", { inCodeMark: false });
	new InputRule(/(?:^|[\s\{\[\(\<'"\u2018\u201C])(')$/, "‘", { inCodeMark: false });
	new InputRule(/'$/, "’", { inCodeMark: false });
	/**
	Build an input rule for automatically wrapping a textblock when a
	given string is typed. The `regexp` argument is
	directly passed through to the `InputRule` constructor. You'll
	probably want the regexp to start with `^`, so that the pattern can
	only occur at the start of a textblock.
	
	`nodeType` is the type of node to wrap in. If it needs attributes,
	you can either pass them directly, or pass a function that will
	compute them from the regular expression match.
	
	By default, if there's a node with the same type above the newly
	wrapped node, the rule will try to [join](https://prosemirror.net/docs/ref/#transform.Transform.join) those
	two nodes. You can pass a join predicate, which takes a regular
	expression match and the node before the wrapped node, and can
	return a boolean to indicate whether a join should happen.
	*/
	function wrappingInputRule(regexp, nodeType, getAttrs = null, joinPredicate) {
		return new InputRule(regexp, (state, match, start, end) => {
			let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
			let tr = state.tr.delete(start, end);
			let range = tr.doc.resolve(start).blockRange(), wrapping = range && findWrapping(range, nodeType, attrs);
			if (!wrapping) return null;
			tr.wrap(range, wrapping);
			let before = tr.doc.resolve(start - 1).nodeBefore;
			if (before && before.type == nodeType && canJoin(tr.doc, start - 1) && (!joinPredicate || joinPredicate(match, before))) tr.join(start - 1);
			return tr;
		});
	}
	/**
	Build an input rule that changes the type of a textblock when the
	matched text is typed into it. You'll usually want to start your
	regexp with `^` to that it is only matched at the start of a
	textblock. The optional `getAttrs` parameter can be used to compute
	the new node's attributes, and works the same as in the
	`wrappingInputRule` function.
	*/
	function textblockTypeInputRule(regexp, nodeType, getAttrs = null) {
		return new InputRule(regexp, (state, match, start, end) => {
			let $start = state.doc.resolve(start);
			let attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
			if (!$start.node(-1).canReplaceWith($start.index(-1), $start.indexAfter(-1), nodeType)) return null;
			return state.tr.delete(start, end).setBlockType(start, start, nodeType, attrs);
		});
	}
	//#endregion
	//#region node_modules/prosemirror-schema-list/dist/index.js
	/**
	Returns a command function that wraps the selection in a list with
	the given type an attributes. If `dispatch` is null, only return a
	value to indicate whether this is possible, but don't actually
	perform the change.
	*/
	function wrapInList(listType, attrs = null) {
		return function(state, dispatch) {
			let { $from, $to } = state.selection;
			let range = $from.blockRange($to);
			if (!range) return false;
			let tr = dispatch ? state.tr : null;
			if (!wrapRangeInList(tr, range, listType, attrs)) return false;
			if (dispatch) dispatch(tr.scrollIntoView());
			return true;
		};
	}
	/**
	Try to wrap the given node range in a list of the given type.
	Return `true` when this is possible, `false` otherwise. When `tr`
	is non-null, the wrapping is added to that transaction. When it is
	`null`, the function only queries whether the wrapping is
	possible.
	*/
	function wrapRangeInList(tr, range, listType, attrs = null) {
		let doJoin = false, outerRange = range, doc = range.$from.doc;
		if (range.depth >= 2 && range.$from.node(range.depth - 1).type.compatibleContent(listType) && range.startIndex == 0) {
			if (range.$from.index(range.depth - 1) == 0) return false;
			let $insert = doc.resolve(range.start - 2);
			outerRange = new NodeRange($insert, $insert, range.depth);
			if (range.endIndex < range.parent.childCount) range = new NodeRange(range.$from, doc.resolve(range.$to.end(range.depth)), range.depth);
			doJoin = true;
		}
		let wrap = findWrapping(outerRange, listType, attrs, range);
		if (!wrap) return false;
		if (tr) doWrapInList(tr, range, wrap, doJoin, listType);
		return true;
	}
	function doWrapInList(tr, range, wrappers, joinBefore, listType) {
		let content = Fragment.empty;
		for (let i = wrappers.length - 1; i >= 0; i--) content = Fragment.from(wrappers[i].type.create(wrappers[i].attrs, content));
		tr.step(new ReplaceAroundStep(range.start - (joinBefore ? 2 : 0), range.end, range.start, range.end, new Slice(content, 0, 0), wrappers.length, true));
		let found = 0;
		for (let i = 0; i < wrappers.length; i++) if (wrappers[i].type == listType) found = i + 1;
		let splitDepth = wrappers.length - found;
		let splitPos = range.start + wrappers.length - (joinBefore ? 2 : 0), parent = range.parent;
		for (let i = range.startIndex, e = range.endIndex, first = true; i < e; i++, first = false) {
			if (!first && canSplit(tr.doc, splitPos, splitDepth)) {
				tr.split(splitPos, splitDepth);
				splitPos += 2 * splitDepth;
			}
			splitPos += parent.child(i).nodeSize;
		}
		return tr;
	}
	/**
	Build a command that splits a non-empty textblock at the top level
	of a list item by also splitting that list item.
	*/
	function splitListItem(itemType, itemAttrs) {
		return function(state, dispatch) {
			let { $from, $to, node } = state.selection;
			if (node && node.isBlock || $from.depth < 2 || !$from.sameParent($to)) return false;
			let grandParent = $from.node(-1);
			if (grandParent.type != itemType) return false;
			if ($from.parent.content.size == 0 && $from.node(-1).childCount == $from.indexAfter(-1)) {
				if ($from.depth == 3 || $from.node(-3).type != itemType || $from.index(-2) != $from.node(-2).childCount - 1) return false;
				if (dispatch) {
					let wrap = Fragment.empty;
					let depthBefore = $from.index(-1) ? 1 : $from.index(-2) ? 2 : 3;
					for (let d = $from.depth - depthBefore; d >= $from.depth - 3; d--) wrap = Fragment.from($from.node(d).copy(wrap));
					let depthAfter = $from.indexAfter(-1) < $from.node(-2).childCount ? 1 : $from.indexAfter(-2) < $from.node(-3).childCount ? 2 : 3;
					wrap = wrap.append(Fragment.from(itemType.createAndFill()));
					let start = $from.before($from.depth - (depthBefore - 1));
					let tr = state.tr.replace(start, $from.after(-depthAfter), new Slice(wrap, 4 - depthBefore, 0));
					let sel = -1;
					tr.doc.nodesBetween(start, tr.doc.content.size, (node, pos) => {
						if (sel > -1) return false;
						if (node.isTextblock && node.content.size == 0) sel = pos + 1;
					});
					if (sel > -1) tr.setSelection(Selection.near(tr.doc.resolve(sel)));
					dispatch(tr.scrollIntoView());
				}
				return true;
			}
			let nextType = $to.pos == $from.end() ? grandParent.contentMatchAt(0).defaultType : null;
			let tr = state.tr.delete($from.pos, $to.pos);
			let types = nextType ? [itemAttrs ? {
				type: itemType,
				attrs: itemAttrs
			} : null, { type: nextType }] : void 0;
			if (!canSplit(tr.doc, $from.pos, 2, types)) return false;
			if (dispatch) dispatch(tr.split($from.pos, 2, types).scrollIntoView());
			return true;
		};
	}
	/**
	Create a command to lift the list item around the selection up into
	a wrapping list.
	*/
	function liftListItem(itemType) {
		return function(state, dispatch) {
			let { $from, $to } = state.selection;
			let range = $from.blockRange($to, (node) => node.childCount > 0 && node.firstChild.type == itemType);
			if (!range) return false;
			if (!dispatch) return true;
			if ($from.node(range.depth - 1).type == itemType) return liftToOuterList(state, dispatch, itemType, range);
			else return liftOutOfList(state, dispatch, range);
		};
	}
	function liftToOuterList(state, dispatch, itemType, range) {
		let tr = state.tr, end = range.end, endOfList = range.$to.end(range.depth);
		if (end < endOfList) {
			tr.step(new ReplaceAroundStep(end - 1, endOfList, end, endOfList, new Slice(Fragment.from(itemType.create(null, range.parent.copy())), 1, 0), 1, true));
			range = new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
		}
		const target = liftTarget(range);
		if (target == null) return false;
		tr.lift(range, target);
		let $after = tr.doc.resolve(tr.mapping.map(end, -1) - 1);
		if (canJoin(tr.doc, $after.pos) && $after.nodeBefore.type == $after.nodeAfter.type) tr.join($after.pos);
		dispatch(tr.scrollIntoView());
		return true;
	}
	function liftOutOfList(state, dispatch, range) {
		let tr = state.tr, list = range.parent;
		for (let pos = range.end, i = range.endIndex - 1, e = range.startIndex; i > e; i--) {
			pos -= list.child(i).nodeSize;
			tr.delete(pos - 1, pos + 1);
		}
		let $start = tr.doc.resolve(range.start), item = $start.nodeAfter;
		if (tr.mapping.map(range.end) != range.start + $start.nodeAfter.nodeSize) return false;
		let atStart = range.startIndex == 0, atEnd = range.endIndex == list.childCount;
		let parent = $start.node(-1), indexBefore = $start.index(-1);
		if (!parent.canReplace(indexBefore + (atStart ? 0 : 1), indexBefore + 1, item.content.append(atEnd ? Fragment.empty : Fragment.from(list)))) return false;
		let start = $start.pos, end = start + item.nodeSize;
		tr.step(new ReplaceAroundStep(start - (atStart ? 1 : 0), end + (atEnd ? 1 : 0), start + 1, end - 1, new Slice((atStart ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))).append(atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))), atStart ? 0 : 1, atEnd ? 0 : 1), atStart ? 0 : 1));
		dispatch(tr.scrollIntoView());
		return true;
	}
	/**
	Create a command to sink the list item around the selection down
	into an inner list.
	*/
	function sinkListItem(itemType) {
		return function(state, dispatch) {
			let { $from, $to } = state.selection;
			let range = $from.blockRange($to, (node) => node.childCount > 0 && node.firstChild.type == itemType);
			if (!range) return false;
			let startIndex = range.startIndex;
			if (startIndex == 0) return false;
			let parent = range.parent, nodeBefore = parent.child(startIndex - 1);
			if (nodeBefore.type != itemType) return false;
			if (dispatch) {
				let nestedBefore = nodeBefore.lastChild && nodeBefore.lastChild.type == parent.type;
				let inner = Fragment.from(nestedBefore ? itemType.create() : null);
				let slice = new Slice(Fragment.from(itemType.create(null, Fragment.from(parent.type.create(null, inner)))), nestedBefore ? 3 : 1, 0);
				let before = range.start, after = range.end;
				dispatch(state.tr.step(new ReplaceAroundStep(before - (nestedBefore ? 3 : 1), after, before, after, slice, 1, true)).scrollIntoView());
			}
			return true;
		};
	}
	//#endregion
	//#region node_modules/prosemirror-remark/dist/prosemirror-remark.js
	var BlockquoteExtension = class extends NodeExtension {
		proseMirrorInputRules(proseMirrorSchema) {
			return [wrappingInputRule(/^\s{0,3}>\s$/u, proseMirrorSchema.nodes[this.proseMirrorNodeName()])];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			return { "Mod->": wrapIn(proseMirrorSchema.nodes[this.proseMirrorNodeName()]) };
		}
		proseMirrorNodeName() {
			return "blockquote";
		}
		proseMirrorNodeSpec() {
			return {
				content: "block+",
				group: "block",
				parseDOM: [{ tag: "blockquote" }],
				toDOM() {
					return ["blockquote", 0];
				}
			};
		}
		proseMirrorNodeToUnistNodes(_node, convertedChildren) {
			return [{
				children: convertedChildren,
				type: this.unistNodeName()
			}];
		}
		unistNodeName() {
			return "blockquote";
		}
		unistNodeToProseMirrorNodes(_node, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren);
		}
	};
	var BoldExtension = class extends MarkExtension {
		processConvertedUnistNode(convertedNode) {
			return {
				children: [convertedNode],
				type: this.unistNodeName()
			};
		}
		proseMirrorInputRules(proseMirrorSchema) {
			return [new MarkInputRule(/\*\*([^\s](?:.*[^\s])?)\*\*([\s\S])$/u, proseMirrorSchema.marks[this.proseMirrorMarkName()]), new MarkInputRule(/__([^\s](?:.*[^\s])?)__([\s\S])$/u, proseMirrorSchema.marks[this.proseMirrorMarkName()])];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			const markType = proseMirrorSchema.marks[this.proseMirrorMarkName()];
			return {
				"Mod-b": toggleMark(markType),
				"Mod-B": toggleMark(markType)
			};
		}
		proseMirrorMarkName() {
			return "strong";
		}
		proseMirrorMarkSpec() {
			return {
				parseDOM: [
					{ tag: "b" },
					{ tag: "strong" },
					{
						getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/u.test(value) && null,
						style: "font-weight"
					}
				],
				toDOM() {
					return ["strong", 0];
				}
			};
		}
		unistNodeName() {
			return "strong";
		}
		unistNodeToProseMirrorNodes(_node, proseMirrorSchema, convertedChildren) {
			return convertedChildren.map((child) => child.mark(child.marks.concat([proseMirrorSchema.marks[this.proseMirrorMarkName()].create()])));
		}
	};
	var BreakExtension = class extends NodeExtension {
		proseMirrorKeymap(proseMirrorSchema) {
			const command = chainCommands(exitCode, (state, dispatch) => {
				if (dispatch) dispatch(state.tr.replaceSelectionWith(proseMirrorSchema.nodes[this.proseMirrorNodeName()].create()).scrollIntoView());
				return true;
			});
			return {
				"Mod-Enter": command,
				"Shift-Enter": command,
				...(typeof navigator !== "undefined" ? /Mac|iP(hone|[oa]d)/u.test(navigator.platform) : false) && { "Ctrl-Enter": command }
			};
		}
		proseMirrorNodeName() {
			return "hard_break";
		}
		proseMirrorNodeSpec() {
			return {
				group: "inline",
				inline: true,
				parseDOM: [{ tag: "br" }],
				selectable: false,
				toDOM() {
					return ["br"];
				}
			};
		}
		proseMirrorNodeToUnistNodes() {
			return [{ type: this.unistNodeName() }];
		}
		unistNodeName() {
			return "break";
		}
		unistNodeToProseMirrorNodes(_node, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren);
		}
	};
	var TextExtension = class extends NodeExtension {
		proseMirrorNodeName() {
			return "text";
		}
		proseMirrorNodeSpec() {
			return { group: "inline" };
		}
		proseMirrorNodeToUnistNodes(node2) {
			return [{
				type: this.unistNodeName(),
				value: node2.text ?? ""
			}];
		}
		unistNodeName() {
			return "text";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema) {
			return [proseMirrorSchema.text(node2.value)];
		}
	};
	var CodeBlockExtension = class CodeBlockExtension extends NodeExtension {
		static liftOutOfCodeBlock() {
			return (state, dispatch) => {
				const { $from, $to } = state.selection;
				if (!$from.sameParent($to) || $from.parent.type.name !== "code_block" || $from.parentOffset !== $from.parent.content.size || !$from.parent.textBetween(0, $from.parentOffset).endsWith("\n\n")) return false;
				if (dispatch) {
					const tr = state.tr;
					dispatch(tr.deleteRange($from.pos - 2, $from.pos).insert($from.pos - 1, tr.doc.type.schema.nodes["paragraph"].create()).setSelection(Selection.near(tr.doc.resolve($from.pos), 1)).scrollIntoView());
				}
				return true;
			};
		}
		dependencies() {
			return [new TextExtension()];
		}
		proseMirrorInputRules(proseMirrorSchema) {
			return [textblockTypeInputRule(/^\s{0,3}```$/u, proseMirrorSchema.nodes[this.proseMirrorNodeName()]), textblockTypeInputRule(/^\s{4}$/u, proseMirrorSchema.nodes[this.proseMirrorNodeName()])];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			return {
				Enter: CodeBlockExtension.liftOutOfCodeBlock(),
				"Shift-Mod-\\": setBlockType(proseMirrorSchema.nodes[this.proseMirrorNodeName()])
			};
		}
		proseMirrorNodeName() {
			return "code_block";
		}
		proseMirrorNodeSpec() {
			return {
				code: true,
				content: "text*",
				defining: true,
				group: "block",
				marks: "",
				parseDOM: [{
					preserveWhitespace: "full",
					tag: "pre"
				}],
				toDOM() {
					return ["pre", ["code", 0]];
				}
			};
		}
		proseMirrorNodeToUnistNodes(_node, convertedChildren) {
			return [{
				type: this.unistNodeName(),
				value: convertedChildren.map((child) => child.value).join("")
			}];
		}
		unistNodeName() {
			return "code";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, [proseMirrorSchema.text(node2.value)]);
		}
	};
	var DefinitionExtension = class extends NodeExtension {
		proseMirrorNodeName() {
			return null;
		}
		proseMirrorNodeSpec() {
			return null;
		}
		proseMirrorNodeToUnistNodes() {
			return [];
		}
		unistNodeName() {
			return "definition";
		}
		unistNodeToProseMirrorNodes(node2, _proseMirrorSchema, _convertedChildren, context) {
			context.DefinitionExtension ??= { definitions: {} };
			context.DefinitionExtension.definitions[node2.identifier] = {
				title: node2.title,
				url: node2.url
			};
			return [];
		}
	};
	var ParagraphExtension = class extends NodeExtension {
		proseMirrorNodeName() {
			return "paragraph";
		}
		proseMirrorNodeSpec() {
			return {
				content: "inline*",
				group: "block",
				parseDOM: [{ tag: "p" }],
				toDOM() {
					return ["p", 0];
				}
			};
		}
		proseMirrorNodeToUnistNodes(_node, convertedChildren) {
			return [{
				children: convertedChildren,
				type: this.unistNodeName()
			}];
		}
		unistNodeName() {
			return "paragraph";
		}
		unistNodeToProseMirrorNodes(_node, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren);
		}
	};
	var HeadingExtension = class HeadingExtension extends NodeExtension {
		static headingLevelCommandBuilder(proseMirrorSchema, levelUpdate, onlyAtStart) {
			return (state, dispatch, view) => {
				if (onlyAtStart && !HeadingExtension.isAtStart(state, view)) return false;
				const { $anchor } = state.selection;
				const headingNode = $anchor.parent;
				if (headingNode.type.name !== "heading") return false;
				const newHeadingLevel = headingNode.attrs["level"] + levelUpdate;
				if (newHeadingLevel < 0 || newHeadingLevel > 6) return false;
				if (dispatch === void 0) return true;
				const headingPosition = $anchor.before($anchor.depth);
				if (newHeadingLevel > 0) dispatch(state.tr.setNodeMarkup(headingPosition, void 0, { level: newHeadingLevel }));
				else dispatch(state.tr.setNodeMarkup(headingPosition, proseMirrorSchema.nodes["paragraph"]));
				return true;
			};
		}
		static isAtStart(state, view) {
			if (!state.selection.empty) return false;
			if (view !== void 0) return view.endOfTextblock("backward", state);
			return state.selection.$anchor.parentOffset > 0;
		}
		dependencies() {
			return [new ParagraphExtension(), new TextExtension()];
		}
		proseMirrorInputRules(proseMirrorSchema) {
			return [textblockTypeInputRule(/^\s{0,3}(#{1,6})\s$/u, proseMirrorSchema.nodes[this.proseMirrorNodeName()], (match) => ({ level: match[1].length }))];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			const keymap = {
				"#": HeadingExtension.headingLevelCommandBuilder(proseMirrorSchema, 1, true),
				Backspace: HeadingExtension.headingLevelCommandBuilder(proseMirrorSchema, -1, true),
				"Shift-Tab": HeadingExtension.headingLevelCommandBuilder(proseMirrorSchema, -1, false),
				Tab: HeadingExtension.headingLevelCommandBuilder(proseMirrorSchema, 1, false)
			};
			for (let i = 1; i <= 6; i++) keymap[`Shift-Mod-${i.toString()}`] = setBlockType(proseMirrorSchema.nodes[this.proseMirrorNodeName()], { level: i });
			return keymap;
		}
		proseMirrorNodeName() {
			return "heading";
		}
		proseMirrorNodeSpec() {
			return {
				attrs: { level: { default: 1 } },
				content: "text*",
				defining: true,
				group: "block",
				parseDOM: [
					{
						attrs: { level: 1 },
						tag: "h1"
					},
					{
						attrs: { level: 2 },
						tag: "h2"
					},
					{
						attrs: { level: 3 },
						tag: "h3"
					},
					{
						attrs: { level: 4 },
						tag: "h4"
					},
					{
						attrs: { level: 5 },
						tag: "h5"
					},
					{
						attrs: { level: 6 },
						tag: "h6"
					}
				],
				toDOM(node2) {
					return [`h${node2.attrs["level"].toString()}`, 0];
				}
			};
		}
		proseMirrorNodeToUnistNodes(node2, convertedChildren) {
			return [{
				children: convertedChildren,
				depth: node2.attrs["level"],
				type: this.unistNodeName()
			}];
		}
		unistNodeName() {
			return "heading";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren, { level: node2.depth });
		}
	};
	var HorizontalRuleExtension = class extends NodeExtension {
		proseMirrorInputRules(proseMirrorSchema) {
			return [new InputRule(/^\s{0,3}(?:\*\*\*|---|___)\n$/u, (state, _, start, end) => state.tr.replaceWith(start, end, createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, [])))];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			return { "Mod-_": (state, dispatch) => {
				if (dispatch) dispatch(state.tr.replaceSelectionWith(proseMirrorSchema.nodes[this.proseMirrorNodeName()].create()).scrollIntoView());
				return true;
			} };
		}
		proseMirrorNodeName() {
			return "horizontal_rule";
		}
		proseMirrorNodeSpec() {
			return {
				group: "block",
				parseDOM: [{ tag: "hr" }],
				toDOM() {
					return ["div", ["hr"]];
				}
			};
		}
		proseMirrorNodeToUnistNodes() {
			return [{ type: this.unistNodeName() }];
		}
		unistNodeName() {
			return "thematicBreak";
		}
		unistNodeToProseMirrorNodes(_node, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren);
		}
	};
	var ImageExtension = class extends NodeExtension {
		dependencies() {
			return [new ParagraphExtension()];
		}
		proseMirrorNodeName() {
			return "image";
		}
		proseMirrorNodeSpec() {
			return {
				attrs: {
					alt: { default: null },
					src: {},
					title: { default: null }
				},
				draggable: true,
				group: "inline",
				inline: true,
				parseDOM: [{
					getAttrs(dom) {
						return {
							alt: dom.getAttribute("alt"),
							src: dom.getAttribute("src"),
							title: dom.getAttribute("title")
						};
					},
					tag: "img[src]"
				}],
				toDOM(node2) {
					return ["img", node2.attrs];
				}
			};
		}
		proseMirrorNodeToUnistNodes(node2) {
			return [{
				type: this.unistNodeName(),
				url: node2.attrs["src"],
				...node2.attrs["alt"] !== null && { alt: node2.attrs["alt"] },
				...node2.attrs["title"] !== null && { title: node2.attrs["title"] }
			}];
		}
		unistNodeName() {
			return "image";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren, {
				alt: node2.alt,
				src: node2.url,
				title: node2.title
			});
		}
	};
	var ImageReferenceExtension = class extends NodeExtension {
		dependencies() {
			return [new DefinitionExtension(), new ImageExtension()];
		}
		postUnistToProseMirrorHook(context) {
			if (context.ImageReferenceExtension === void 0 || context.DefinitionExtension === void 0) return;
			for (const id in context.ImageReferenceExtension.proseMirrorNodes) {
				if (!(id in context.DefinitionExtension.definitions)) continue;
				const definition2 = context.DefinitionExtension.definitions[id];
				const attrs = context.ImageReferenceExtension.proseMirrorNodes[id].attrs;
				attrs["src"] = definition2.url;
				if (definition2.title !== void 0) attrs["title"] = definition2.title;
			}
		}
		proseMirrorNodeName() {
			return null;
		}
		proseMirrorNodeSpec() {
			return null;
		}
		proseMirrorNodeToUnistNodes() {
			return [];
		}
		unistNodeName() {
			return "imageReference";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema, convertedChildren, context) {
			const proseMirrorNode = proseMirrorSchema.nodes["image"].createAndFill({
				alt: node2.alt,
				src: "",
				title: node2.label
			}, convertedChildren);
			if (proseMirrorNode === null) return [];
			context.ImageReferenceExtension ??= { proseMirrorNodes: {} };
			context.ImageReferenceExtension.proseMirrorNodes[node2.identifier] = proseMirrorNode;
			return [proseMirrorNode];
		}
	};
	var InlineCodeExtension = class extends MarkExtension {
		processConvertedUnistNode(convertedNode) {
			return {
				type: this.unistNodeName(),
				value: convertedNode.value
			};
		}
		proseMirrorInputRules(proseMirrorSchema) {
			return [new MarkInputRule(/`([^\s](?:.*[^\s])?)`([\s\S])$/u, proseMirrorSchema.marks[this.proseMirrorMarkName()])];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			const markType = proseMirrorSchema.marks[this.proseMirrorMarkName()];
			return { "Ctrl-`": toggleMark(markType) };
		}
		proseMirrorMarkName() {
			return "code";
		}
		proseMirrorMarkSpec() {
			return {
				inclusive: false,
				parseDOM: [{ tag: "code" }],
				toDOM() {
					return ["code", 0];
				}
			};
		}
		unistNodeName() {
			return "inlineCode";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema) {
			return [proseMirrorSchema.text(node2.value).mark([proseMirrorSchema.marks[this.proseMirrorMarkName()].create()])];
		}
	};
	var ItalicExtension = class extends MarkExtension {
		processConvertedUnistNode(convertedNode) {
			return {
				children: [convertedNode],
				type: this.unistNodeName()
			};
		}
		proseMirrorInputRules(proseMirrorSchema) {
			return [new MarkInputRule(/* @__PURE__ */ new RegExp("(?<!\\*)\\*([^\\s*](?:.*[^\\s])?)\\*([^*])$", "u"), proseMirrorSchema.marks[this.proseMirrorMarkName()]), new MarkInputRule(/* @__PURE__ */ new RegExp("(?<!_)_([^\\s_](?:.*[^\\s])?)_([^_])$", "u"), proseMirrorSchema.marks[this.proseMirrorMarkName()])];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			const markType = proseMirrorSchema.marks[this.proseMirrorMarkName()];
			return {
				"Mod-i": toggleMark(markType),
				"Mod-I": toggleMark(markType)
			};
		}
		proseMirrorMarkName() {
			return "em";
		}
		proseMirrorMarkSpec() {
			return {
				parseDOM: [
					{ tag: "i" },
					{ tag: "em" },
					{
						getAttrs: (value) => value === "italic" && null,
						style: "font-style"
					}
				],
				toDOM() {
					return ["em", 0];
				}
			};
		}
		unistNodeName() {
			return "emphasis";
		}
		unistNodeToProseMirrorNodes(_node, proseMirrorSchema, convertedChildren) {
			return convertedChildren.map((child) => child.mark(child.marks.concat([proseMirrorSchema.marks[this.proseMirrorMarkName()].create()])));
		}
	};
	var LinkExtension = class extends MarkExtension {
		processConvertedUnistNode(convertedNode, originalMark) {
			return {
				type: this.unistNodeName(),
				url: originalMark.attrs["href"],
				...originalMark.attrs["title"] !== null && { title: originalMark.attrs["title"] },
				children: [convertedNode]
			};
		}
		proseMirrorMarkName() {
			return "link";
		}
		proseMirrorMarkSpec() {
			return {
				attrs: {
					href: {},
					title: { default: null }
				},
				inclusive: false,
				parseDOM: [{
					getAttrs(dom) {
						return {
							href: dom.getAttribute("href"),
							title: dom.getAttribute("title")
						};
					},
					tag: "a[href]"
				}],
				toDOM(node2) {
					return [
						"a",
						node2.attrs,
						0
					];
				}
			};
		}
		unistNodeName() {
			return "link";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema, convertedChildren) {
			return convertedChildren.map((child) => child.mark(child.marks.concat([proseMirrorSchema.marks[this.proseMirrorMarkName()].create({
				href: node2.url,
				title: node2.title
			})])));
		}
	};
	var LinkReferenceExtension = class extends MarkExtension {
		dependencies() {
			return [new DefinitionExtension(), new LinkExtension()];
		}
		postUnistToProseMirrorHook(context) {
			if (context.LinkReferenceExtension === void 0 || context.DefinitionExtension === void 0) return;
			for (const id in context.LinkReferenceExtension.marks) {
				if (!(id in context.DefinitionExtension.definitions)) continue;
				const definition2 = context.DefinitionExtension.definitions[id];
				const attrs = context.LinkReferenceExtension.marks[id].attrs;
				attrs["href"] = definition2.url;
				if (definition2.title !== void 0) attrs["title"] = definition2.title;
			}
		}
		processConvertedUnistNode(convertedNode) {
			return convertedNode;
		}
		proseMirrorMarkName() {
			return null;
		}
		proseMirrorMarkSpec() {
			return null;
		}
		unistNodeName() {
			return "linkReference";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema, convertedChildren, context) {
			const mark = proseMirrorSchema.marks["link"].create({
				href: null,
				title: null
			});
			context.LinkReferenceExtension ??= { marks: {} };
			context.LinkReferenceExtension.marks[node2.identifier] = mark;
			return convertedChildren.map((child) => child.mark(child.marks.concat([mark])));
		}
	};
	var ListItemExtension = class extends NodeExtension {
		proseMirrorKeymap(proseMirrorSchema) {
			const nodeType = proseMirrorSchema.nodes[this.proseMirrorNodeName()];
			return {
				Enter: splitListItem(nodeType),
				"Shift-Tab": liftListItem(nodeType),
				Tab: sinkListItem(nodeType)
			};
		}
		proseMirrorNodeName() {
			return "regular_list_item";
		}
		proseMirrorNodeSpec() {
			return {
				content: "paragraph block*",
				defining: true,
				group: "list_item",
				parseDOM: [{ tag: "li" }],
				toDOM() {
					return ["li", 0];
				}
			};
		}
		proseMirrorNodeToUnistNodes(_node, convertedChildren) {
			return [{
				children: convertedChildren,
				type: this.unistNodeName()
			}];
		}
		unistNodeName() {
			return "listItem";
		}
		unistNodeToProseMirrorNodes(_node, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren);
		}
		unistToProseMirrorTest(node2) {
			return node2.type === this.unistNodeName() && (!("checked" in node2) || typeof node2.checked !== "boolean");
		}
	};
	var OrderedListExtension = class extends NodeExtension {
		dependencies() {
			return [new ListItemExtension()];
		}
		proseMirrorInputRules(proseMirrorSchema) {
			return [wrappingInputRule(/^\s{0,3}(\d+)\.\s$/u, proseMirrorSchema.nodes[this.proseMirrorNodeName()], (match) => ({ start: +match[1] }), (match, node2) => node2.childCount + node2.attrs["start"] === +match[1])];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			return { "Shift-Mod-9": wrapInList(proseMirrorSchema.nodes[this.proseMirrorNodeName()]) };
		}
		proseMirrorNodeName() {
			return "ordered_list";
		}
		proseMirrorNodeSpec() {
			return {
				attrs: {
					spread: { default: false },
					start: { default: 1 }
				},
				content: "list_item+",
				group: "block",
				parseDOM: [{
					getAttrs(dom) {
						const start = dom.getAttribute("start");
						return {
							spread: dom.getAttribute("data-spread") === "true",
							start: start !== null ? parseInt(start, 10) : 1
						};
					},
					tag: "ol"
				}],
				toDOM(node2) {
					return [
						"ol",
						{
							"data-spread": node2.attrs["spread"],
							start: node2.attrs["start"]
						},
						0
					];
				}
			};
		}
		proseMirrorNodeToUnistNodes(node2, convertedChildren) {
			const spread = node2.attrs["spread"];
			return [{
				children: convertedChildren.map((child) => {
					child.spread = spread;
					return child;
				}),
				ordered: true,
				spread,
				start: node2.attrs["start"],
				type: this.unistNodeName()
			}];
		}
		unistNodeName() {
			return "list";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren, {
				spread: node2.spread,
				start: node2.start ?? 1
			});
		}
		unistToProseMirrorTest(node2) {
			return node2.type === this.unistNodeName() && node2.ordered === true;
		}
	};
	var RootExtension = class extends NodeExtension {
		proseMirrorNodeName() {
			return "doc";
		}
		proseMirrorNodeSpec() {
			return { content: "block+" };
		}
		proseMirrorNodeToUnistNodes(_node, convertedChildren) {
			return [{
				children: convertedChildren,
				type: this.unistNodeName()
			}];
		}
		unistNodeName() {
			return "root";
		}
		unistNodeToProseMirrorNodes(_node, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren);
		}
	};
	var UnorderedListExtension = class extends NodeExtension {
		dependencies() {
			return [new ListItemExtension()];
		}
		proseMirrorInputRules(proseMirrorSchema) {
			return [wrappingInputRule(/^\s{0,3}([-+*])\s$/u, proseMirrorSchema.nodes[this.proseMirrorNodeName()])];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			return { "Shift-Mod-8": wrapInList(proseMirrorSchema.nodes[this.proseMirrorNodeName()]) };
		}
		proseMirrorNodeName() {
			return "bullet_list";
		}
		proseMirrorNodeSpec() {
			return {
				attrs: { spread: { default: false } },
				content: "list_item+",
				group: "block",
				parseDOM: [{
					getAttrs(dom) {
						return { spread: dom.getAttribute("data-spread") === "true" };
					},
					tag: "ul"
				}],
				toDOM(node2) {
					return [
						"ul",
						{ "data-spread": node2.attrs["spread"] },
						0
					];
				}
			};
		}
		proseMirrorNodeToUnistNodes(node2, convertedChildren) {
			const spread = node2.attrs["spread"];
			return [{
				children: convertedChildren.map((child) => {
					child.spread = spread;
					return child;
				}),
				ordered: false,
				spread,
				type: this.unistNodeName()
			}];
		}
		unistNodeName() {
			return "list";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren, { spread: node2.spread });
		}
		unistToProseMirrorTest(node2) {
			return node2.type === this.unistNodeName() && node2.ordered !== true;
		}
	};
	var MarkdownExtension = class extends Extension {
		dependencies() {
			return [
				new ParagraphExtension(),
				new BlockquoteExtension(),
				new BoldExtension(),
				new BreakExtension(),
				new CodeBlockExtension(),
				new DefinitionExtension(),
				new HeadingExtension(),
				new HorizontalRuleExtension(),
				new ImageExtension(),
				new ImageReferenceExtension(),
				new InlineCodeExtension(),
				new ItalicExtension(),
				new LinkExtension(),
				new LinkReferenceExtension(),
				new ListItemExtension(),
				new OrderedListExtension(),
				new RootExtension(),
				new TextExtension(),
				new UnorderedListExtension()
			];
		}
		unifiedInitializationHook(processor) {
			return processor.use(remarkParse).use(remarkStringify, {
				fences: true,
				listItemIndent: "one",
				resourceLink: true,
				rule: "-"
			});
		}
	};
	function ccount(value, character) {
		const source = String(value);
		if (typeof character !== "string") throw new TypeError("Expected character");
		let count = 0;
		let index = source.indexOf(character);
		while (index !== -1) {
			count++;
			index = source.indexOf(character, index + character.length);
		}
		return count;
	}
	var asciiAlpha = regexCheck(/[A-Za-z]/);
	var asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
	function asciiControl(code2) {
		return code2 !== null && (code2 < 32 || code2 === 127);
	}
	function markdownLineEnding(code2) {
		return code2 !== null && code2 < -2;
	}
	function markdownLineEndingOrSpace(code2) {
		return code2 !== null && (code2 < 0 || code2 === 32);
	}
	function markdownSpace(code2) {
		return code2 === -2 || code2 === -1 || code2 === 32;
	}
	var unicodePunctuation = regexCheck(/* @__PURE__ */ new RegExp("\\p{P}|\\p{S}", "u"));
	var unicodeWhitespace = regexCheck(/\s/);
	function regexCheck(regex) {
		return check;
		function check(code2) {
			return code2 !== null && code2 > -1 && regex.test(String.fromCharCode(code2));
		}
	}
	function escapeStringRegexp(string) {
		if (typeof string !== "string") throw new TypeError("Expected a string");
		return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
	}
	var convert = (function(test) {
		if (test === null || test === void 0) return ok;
		if (typeof test === "function") return castFactory(test);
		if (typeof test === "object") return Array.isArray(test) ? anyFactory(test) : propertiesFactory(
			/** @type {Props} */
			test
		);
		if (typeof test === "string") return typeFactory(test);
		throw new Error("Expected function, string, or object as test");
	});
	function anyFactory(tests) {
		const checks = [];
		let index = -1;
		while (++index < tests.length) checks[index] = convert(tests[index]);
		return castFactory(any);
		function any(...parameters) {
			let index2 = -1;
			while (++index2 < checks.length) if (checks[index2].apply(this, parameters)) return true;
			return false;
		}
	}
	function propertiesFactory(check) {
		const checkAsRecord = check;
		return castFactory(all2);
		function all2(node2) {
			const nodeAsRecord = node2;
			let key;
			for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
			return true;
		}
	}
	function typeFactory(check) {
		return castFactory(type);
		function type(node2) {
			return node2 && node2.type === check;
		}
	}
	function castFactory(testFunction) {
		return check;
		function check(value, index, parent) {
			return Boolean(looksLikeANode(value) && testFunction.call(this, value, typeof index === "number" ? index : void 0, parent || void 0));
		}
	}
	function ok() {
		return true;
	}
	function looksLikeANode(value) {
		return value !== null && typeof value === "object" && "type" in value;
	}
	function color(d) {
		return d;
	}
	var empty = [];
	var CONTINUE = true;
	var EXIT = false;
	var SKIP = "skip";
	function visitParents(tree, test, visitor, reverse) {
		let check;
		if (typeof test === "function" && typeof visitor !== "function") {
			reverse = visitor;
			visitor = test;
		} else check = test;
		const is = convert(check);
		const step = reverse ? -1 : 1;
		factory(tree, void 0, [])();
		function factory(node2, index, parents) {
			const value = node2 && typeof node2 === "object" ? node2 : {};
			if (typeof value.type === "string") {
				const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
				Object.defineProperty(visit2, "name", { value: "node (" + color(node2.type + (name ? "<" + name + ">" : "")) + ")" });
			}
			return visit2;
			function visit2() {
				let result = empty;
				let subresult;
				let offset;
				let grandparents;
				if (!test || is(node2, index, parents[parents.length - 1] || void 0)) {
					result = toResult(visitor(node2, parents));
					if (result[0] === EXIT) return result;
				}
				if ("children" in node2 && node2.children) {
					const nodeAsParent = node2;
					if (nodeAsParent.children && result[0] !== SKIP) {
						offset = (reverse ? nodeAsParent.children.length : -1) + step;
						grandparents = parents.concat(nodeAsParent);
						while (offset > -1 && offset < nodeAsParent.children.length) {
							const child = nodeAsParent.children[offset];
							subresult = factory(child, offset, grandparents)();
							if (subresult[0] === EXIT) return subresult;
							offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
						}
					}
				}
				return result;
			}
		}
	}
	function toResult(value) {
		if (Array.isArray(value)) return value;
		if (typeof value === "number") return [CONTINUE, value];
		return value === null || value === void 0 ? empty : [value];
	}
	function findAndReplace(tree, list2, options) {
		const ignored = convert((options || {}).ignore || []);
		const pairs = toPairs(list2);
		let pairIndex = -1;
		while (++pairIndex < pairs.length) visitParents(tree, "text", visitor);
		function visitor(node2, parents) {
			let index = -1;
			let grandparent;
			while (++index < parents.length) {
				const parent = parents[index];
				const siblings = grandparent ? grandparent.children : void 0;
				if (ignored(parent, siblings ? siblings.indexOf(parent) : void 0, grandparent)) return;
				grandparent = parent;
			}
			if (grandparent) return handler(node2, parents);
		}
		function handler(node2, parents) {
			const parent = parents[parents.length - 1];
			const find = pairs[pairIndex][0];
			const replace = pairs[pairIndex][1];
			let start = 0;
			const index = parent.children.indexOf(node2);
			let change = false;
			let nodes = [];
			find.lastIndex = 0;
			let match = find.exec(node2.value);
			while (match) {
				const position = match.index;
				const matchObject = {
					index: match.index,
					input: match.input,
					stack: [...parents, node2]
				};
				let value = replace(...match, matchObject);
				if (typeof value === "string") value = value.length > 0 ? {
					type: "text",
					value
				} : void 0;
				if (value === false) find.lastIndex = position + 1;
				else {
					if (start !== position) nodes.push({
						type: "text",
						value: node2.value.slice(start, position)
					});
					if (Array.isArray(value)) nodes.push(...value);
					else if (value) nodes.push(value);
					start = position + match[0].length;
					change = true;
				}
				if (!find.global) break;
				match = find.exec(node2.value);
			}
			if (change) {
				if (start < node2.value.length) nodes.push({
					type: "text",
					value: node2.value.slice(start)
				});
				parent.children.splice(index, 1, ...nodes);
			} else nodes = [node2];
			return index + nodes.length;
		}
	}
	function toPairs(tupleOrList) {
		const result = [];
		if (!Array.isArray(tupleOrList)) throw new TypeError("Expected find and replace tuple or list of tuples");
		const list2 = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
		let index = -1;
		while (++index < list2.length) {
			const tuple = list2[index];
			result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
		}
		return result;
	}
	function toExpression(find) {
		return typeof find === "string" ? new RegExp(escapeStringRegexp(find), "g") : find;
	}
	function toFunction(replace) {
		return typeof replace === "function" ? replace : function() {
			return replace;
		};
	}
	var inConstruct = "phrasing";
	var notInConstruct = [
		"autolink",
		"link",
		"image",
		"label"
	];
	function gfmAutolinkLiteralFromMarkdown() {
		return {
			transforms: [transformGfmAutolinkLiterals],
			enter: {
				literalAutolink: enterLiteralAutolink,
				literalAutolinkEmail: enterLiteralAutolinkValue,
				literalAutolinkHttp: enterLiteralAutolinkValue,
				literalAutolinkWww: enterLiteralAutolinkValue
			},
			exit: {
				literalAutolink: exitLiteralAutolink,
				literalAutolinkEmail: exitLiteralAutolinkEmail,
				literalAutolinkHttp: exitLiteralAutolinkHttp,
				literalAutolinkWww: exitLiteralAutolinkWww
			}
		};
	}
	function gfmAutolinkLiteralToMarkdown() {
		return { unsafe: [
			{
				character: "@",
				before: "[+\\-.\\w]",
				after: "[\\-.\\w]",
				inConstruct,
				notInConstruct
			},
			{
				character: ".",
				before: "[Ww]",
				after: "[\\-.\\w]",
				inConstruct,
				notInConstruct
			},
			{
				character: ":",
				before: "[ps]",
				after: "\\/",
				inConstruct,
				notInConstruct
			}
		] };
	}
	function enterLiteralAutolink(token) {
		this.enter({
			type: "link",
			title: null,
			url: "",
			children: []
		}, token);
	}
	function enterLiteralAutolinkValue(token) {
		this.config.enter.autolinkProtocol.call(this, token);
	}
	function exitLiteralAutolinkHttp(token) {
		this.config.exit.autolinkProtocol.call(this, token);
	}
	function exitLiteralAutolinkWww(token) {
		this.config.exit.data.call(this, token);
		const node2 = this.stack[this.stack.length - 1];
		node2.type;
		node2.url = "http://" + this.sliceSerialize(token);
	}
	function exitLiteralAutolinkEmail(token) {
		this.config.exit.autolinkEmail.call(this, token);
	}
	function exitLiteralAutolink(token) {
		this.exit(token);
	}
	function transformGfmAutolinkLiterals(tree) {
		findAndReplace(tree, [[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl], [/* @__PURE__ */ new RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), findEmail]], { ignore: ["link", "linkReference"] });
	}
	function findUrl(_, protocol, domain2, path2, match) {
		let prefix = "";
		if (!previous(match)) return false;
		if (/^w/i.test(protocol)) {
			domain2 = protocol + domain2;
			protocol = "";
			prefix = "http://";
		}
		if (!isCorrectDomain(domain2)) return false;
		const parts = splitUrl(domain2 + path2);
		if (!parts[0]) return false;
		const result = {
			type: "link",
			title: null,
			url: prefix + protocol + parts[0],
			children: [{
				type: "text",
				value: protocol + parts[0]
			}]
		};
		if (parts[1]) return [result, {
			type: "text",
			value: parts[1]
		}];
		return result;
	}
	function findEmail(_, atext, label, match) {
		if (!previous(match, true) || /[-\d_]$/.test(label)) return false;
		return {
			type: "link",
			title: null,
			url: "mailto:" + atext + "@" + label,
			children: [{
				type: "text",
				value: atext + "@" + label
			}]
		};
	}
	function isCorrectDomain(domain2) {
		const parts = domain2.split(".");
		if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) return false;
		return true;
	}
	function splitUrl(url) {
		const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
		if (!trailExec) return [url, void 0];
		url = url.slice(0, trailExec.index);
		let trail2 = trailExec[0];
		let closingParenIndex = trail2.indexOf(")");
		const openingParens = ccount(url, "(");
		let closingParens = ccount(url, ")");
		while (closingParenIndex !== -1 && openingParens > closingParens) {
			url += trail2.slice(0, closingParenIndex + 1);
			trail2 = trail2.slice(closingParenIndex + 1);
			closingParenIndex = trail2.indexOf(")");
			closingParens++;
		}
		return [url, trail2];
	}
	function previous(match, email) {
		const code2 = match.input.charCodeAt(match.index - 1);
		return (match.index === 0 || unicodeWhitespace(code2) || unicodePunctuation(code2)) && (!email || code2 !== 47);
	}
	var wwwPrefix = {
		tokenize: tokenizeWwwPrefix,
		partial: true
	};
	var domain = {
		tokenize: tokenizeDomain,
		partial: true
	};
	var path = {
		tokenize: tokenizePath,
		partial: true
	};
	var trail = {
		tokenize: tokenizeTrail,
		partial: true
	};
	var emailDomainDotTrail = {
		tokenize: tokenizeEmailDomainDotTrail,
		partial: true
	};
	var wwwAutolink = {
		name: "wwwAutolink",
		tokenize: tokenizeWwwAutolink,
		previous: previousWww
	};
	var protocolAutolink = {
		name: "protocolAutolink",
		tokenize: tokenizeProtocolAutolink,
		previous: previousProtocol
	};
	var emailAutolink = {
		name: "emailAutolink",
		tokenize: tokenizeEmailAutolink,
		previous: previousEmail
	};
	var text$1 = {};
	function gfmAutolinkLiteral() {
		return { text: text$1 };
	}
	var code$1 = 48;
	while (code$1 < 123) {
		text$1[code$1] = emailAutolink;
		code$1++;
		if (code$1 === 58) code$1 = 65;
		else if (code$1 === 91) code$1 = 97;
	}
	text$1[43] = emailAutolink;
	text$1[45] = emailAutolink;
	text$1[46] = emailAutolink;
	text$1[95] = emailAutolink;
	text$1[72] = [emailAutolink, protocolAutolink];
	text$1[104] = [emailAutolink, protocolAutolink];
	text$1[87] = [emailAutolink, wwwAutolink];
	text$1[119] = [emailAutolink, wwwAutolink];
	function tokenizeEmailAutolink(effects, ok2, nok) {
		const self = this;
		let dot;
		let data;
		return start;
		function start(code2) {
			if (!gfmAtext(code2) || !previousEmail.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code2);
			effects.enter("literalAutolink");
			effects.enter("literalAutolinkEmail");
			return atext(code2);
		}
		function atext(code2) {
			if (gfmAtext(code2)) {
				effects.consume(code2);
				return atext;
			}
			if (code2 === 64) {
				effects.consume(code2);
				return emailDomain;
			}
			return nok(code2);
		}
		function emailDomain(code2) {
			if (code2 === 46) return effects.check(emailDomainDotTrail, emailDomainAfter, emailDomainDot)(code2);
			if (code2 === 45 || code2 === 95 || asciiAlphanumeric(code2)) {
				data = true;
				effects.consume(code2);
				return emailDomain;
			}
			return emailDomainAfter(code2);
		}
		function emailDomainDot(code2) {
			effects.consume(code2);
			dot = true;
			return emailDomain;
		}
		function emailDomainAfter(code2) {
			if (data && dot && asciiAlpha(self.previous)) {
				effects.exit("literalAutolinkEmail");
				effects.exit("literalAutolink");
				return ok2(code2);
			}
			return nok(code2);
		}
	}
	function tokenizeWwwAutolink(effects, ok2, nok) {
		const self = this;
		return wwwStart;
		function wwwStart(code2) {
			if (code2 !== 87 && code2 !== 119 || !previousWww.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code2);
			effects.enter("literalAutolink");
			effects.enter("literalAutolinkWww");
			return effects.check(wwwPrefix, effects.attempt(domain, effects.attempt(path, wwwAfter), nok), nok)(code2);
		}
		function wwwAfter(code2) {
			effects.exit("literalAutolinkWww");
			effects.exit("literalAutolink");
			return ok2(code2);
		}
	}
	function tokenizeProtocolAutolink(effects, ok2, nok) {
		const self = this;
		let buffer = "";
		let seen = false;
		return protocolStart;
		function protocolStart(code2) {
			if ((code2 === 72 || code2 === 104) && previousProtocol.call(self, self.previous) && !previousUnbalanced(self.events)) {
				effects.enter("literalAutolink");
				effects.enter("literalAutolinkHttp");
				buffer += String.fromCodePoint(code2);
				effects.consume(code2);
				return protocolPrefixInside;
			}
			return nok(code2);
		}
		function protocolPrefixInside(code2) {
			if (asciiAlpha(code2) && buffer.length < 5) {
				buffer += String.fromCodePoint(code2);
				effects.consume(code2);
				return protocolPrefixInside;
			}
			if (code2 === 58) {
				const protocol = buffer.toLowerCase();
				if (protocol === "http" || protocol === "https") {
					effects.consume(code2);
					return protocolSlashesInside;
				}
			}
			return nok(code2);
		}
		function protocolSlashesInside(code2) {
			if (code2 === 47) {
				effects.consume(code2);
				if (seen) return afterProtocol;
				seen = true;
				return protocolSlashesInside;
			}
			return nok(code2);
		}
		function afterProtocol(code2) {
			return code2 === null || asciiControl(code2) || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2) || unicodePunctuation(code2) ? nok(code2) : effects.attempt(domain, effects.attempt(path, protocolAfter), nok)(code2);
		}
		function protocolAfter(code2) {
			effects.exit("literalAutolinkHttp");
			effects.exit("literalAutolink");
			return ok2(code2);
		}
	}
	function tokenizeWwwPrefix(effects, ok2, nok) {
		let size = 0;
		return wwwPrefixInside;
		function wwwPrefixInside(code2) {
			if ((code2 === 87 || code2 === 119) && size < 3) {
				size++;
				effects.consume(code2);
				return wwwPrefixInside;
			}
			if (code2 === 46 && size === 3) {
				effects.consume(code2);
				return wwwPrefixAfter;
			}
			return nok(code2);
		}
		function wwwPrefixAfter(code2) {
			return code2 === null ? nok(code2) : ok2(code2);
		}
	}
	function tokenizeDomain(effects, ok2, nok) {
		let underscoreInLastSegment;
		let underscoreInLastLastSegment;
		let seen;
		return domainInside;
		function domainInside(code2) {
			if (code2 === 46 || code2 === 95) return effects.check(trail, domainAfter, domainAtPunctuation)(code2);
			if (code2 === null || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2) || code2 !== 45 && unicodePunctuation(code2)) return domainAfter(code2);
			seen = true;
			effects.consume(code2);
			return domainInside;
		}
		function domainAtPunctuation(code2) {
			if (code2 === 95) underscoreInLastSegment = true;
			else {
				underscoreInLastLastSegment = underscoreInLastSegment;
				underscoreInLastSegment = void 0;
			}
			effects.consume(code2);
			return domainInside;
		}
		function domainAfter(code2) {
			if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) return nok(code2);
			return ok2(code2);
		}
	}
	function tokenizePath(effects, ok2) {
		let sizeOpen = 0;
		let sizeClose = 0;
		return pathInside;
		function pathInside(code2) {
			if (code2 === 40) {
				sizeOpen++;
				effects.consume(code2);
				return pathInside;
			}
			if (code2 === 41 && sizeClose < sizeOpen) return pathAtPunctuation(code2);
			if (code2 === 33 || code2 === 34 || code2 === 38 || code2 === 39 || code2 === 41 || code2 === 42 || code2 === 44 || code2 === 46 || code2 === 58 || code2 === 59 || code2 === 60 || code2 === 63 || code2 === 93 || code2 === 95 || code2 === 126) return effects.check(trail, ok2, pathAtPunctuation)(code2);
			if (code2 === null || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2)) return ok2(code2);
			effects.consume(code2);
			return pathInside;
		}
		function pathAtPunctuation(code2) {
			if (code2 === 41) sizeClose++;
			effects.consume(code2);
			return pathInside;
		}
	}
	function tokenizeTrail(effects, ok2, nok) {
		return trail2;
		function trail2(code2) {
			if (code2 === 33 || code2 === 34 || code2 === 39 || code2 === 41 || code2 === 42 || code2 === 44 || code2 === 46 || code2 === 58 || code2 === 59 || code2 === 63 || code2 === 95 || code2 === 126) {
				effects.consume(code2);
				return trail2;
			}
			if (code2 === 38) {
				effects.consume(code2);
				return trailCharacterReferenceStart;
			}
			if (code2 === 93) {
				effects.consume(code2);
				return trailBracketAfter;
			}
			if (code2 === 60 || code2 === null || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2)) return ok2(code2);
			return nok(code2);
		}
		function trailBracketAfter(code2) {
			if (code2 === null || code2 === 40 || code2 === 91 || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2)) return ok2(code2);
			return trail2(code2);
		}
		function trailCharacterReferenceStart(code2) {
			return asciiAlpha(code2) ? trailCharacterReferenceInside(code2) : nok(code2);
		}
		function trailCharacterReferenceInside(code2) {
			if (code2 === 59) {
				effects.consume(code2);
				return trail2;
			}
			if (asciiAlpha(code2)) {
				effects.consume(code2);
				return trailCharacterReferenceInside;
			}
			return nok(code2);
		}
	}
	function tokenizeEmailDomainDotTrail(effects, ok2, nok) {
		return start;
		function start(code2) {
			effects.consume(code2);
			return after;
		}
		function after(code2) {
			return asciiAlphanumeric(code2) ? nok(code2) : ok2(code2);
		}
	}
	function previousWww(code2) {
		return code2 === null || code2 === 40 || code2 === 42 || code2 === 95 || code2 === 91 || code2 === 93 || code2 === 126 || markdownLineEndingOrSpace(code2);
	}
	function previousProtocol(code2) {
		return !asciiAlpha(code2);
	}
	function previousEmail(code2) {
		return !(code2 === 47 || gfmAtext(code2));
	}
	function gfmAtext(code2) {
		return code2 === 43 || code2 === 45 || code2 === 46 || code2 === 95 || asciiAlphanumeric(code2);
	}
	function previousUnbalanced(events) {
		let index = events.length;
		let result = false;
		while (index--) {
			const token = events[index][1];
			if ((token.type === "labelLink" || token.type === "labelImage") && !token._balanced) {
				result = true;
				break;
			}
			if (token._gfmAutolinkLiteralWalkedInto) {
				result = false;
				break;
			}
		}
		if (events.length > 0 && !result) events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
		return result;
	}
	function buildUnifiedExtension(micromarkExtensions, fromMarkdownExtensions, toMarkdownExtensions) {
		return function() {
			const data = this.data();
			data.micromarkExtensions ??= [];
			data.fromMarkdownExtensions ??= [];
			data.toMarkdownExtensions ??= [];
			data.micromarkExtensions.push(...micromarkExtensions);
			data.fromMarkdownExtensions.push(...fromMarkdownExtensions);
			data.toMarkdownExtensions.push(...toMarkdownExtensions);
		};
	}
	var ExtendedAutolinkExtension = class extends Extension {
		unifiedInitializationHook(processor) {
			return processor.use(buildUnifiedExtension([gfmAutolinkLiteral()], [gfmAutolinkLiteralFromMarkdown()], [gfmAutolinkLiteralToMarkdown()]));
		}
	};
	var constructsWithoutStrikethrough = [
		"autolink",
		"destinationLiteral",
		"destinationRaw",
		"reference",
		"titleQuote",
		"titleApostrophe"
	];
	handleDelete.peek = peekDelete;
	function gfmStrikethroughFromMarkdown() {
		return {
			canContainEols: ["delete"],
			enter: { strikethrough: enterStrikethrough },
			exit: { strikethrough: exitStrikethrough }
		};
	}
	function gfmStrikethroughToMarkdown() {
		return {
			unsafe: [{
				character: "~",
				inConstruct: "phrasing",
				notInConstruct: constructsWithoutStrikethrough
			}],
			handlers: { delete: handleDelete }
		};
	}
	function enterStrikethrough(token) {
		this.enter({
			type: "delete",
			children: []
		}, token);
	}
	function exitStrikethrough(token) {
		this.exit(token);
	}
	function handleDelete(node2, _, state, info) {
		const tracker = state.createTracker(info);
		const exit = state.enter("strikethrough");
		let value = tracker.move("~~");
		value += state.containerPhrasing(node2, {
			...tracker.current(),
			before: value,
			after: "~"
		});
		value += tracker.move("~~");
		exit();
		return value;
	}
	function peekDelete() {
		return "~";
	}
	function splice(list2, start, remove, items) {
		const end = list2.length;
		let chunkStart = 0;
		let parameters;
		if (start < 0) start = -start > end ? 0 : end + start;
		else start = start > end ? end : start;
		remove = remove > 0 ? remove : 0;
		if (items.length < 1e4) {
			parameters = Array.from(items);
			parameters.unshift(start, remove);
			list2.splice(...parameters);
		} else {
			if (remove) list2.splice(start, remove);
			while (chunkStart < items.length) {
				parameters = items.slice(chunkStart, chunkStart + 1e4);
				parameters.unshift(start, 0);
				list2.splice(...parameters);
				chunkStart += 1e4;
				start += 1e4;
			}
		}
	}
	function classifyCharacter(code2) {
		if (code2 === null || markdownLineEndingOrSpace(code2) || unicodeWhitespace(code2)) return 1;
		if (unicodePunctuation(code2)) return 2;
	}
	function resolveAll(constructs, events, context) {
		const called = [];
		let index = -1;
		while (++index < constructs.length) {
			const resolve = constructs[index].resolveAll;
			if (resolve && !called.includes(resolve)) {
				events = resolve(events, context);
				called.push(resolve);
			}
		}
		return events;
	}
	function gfmStrikethrough(options) {
		let single = {}.singleTilde;
		const tokenizer = {
			name: "strikethrough",
			tokenize: tokenizeStrikethrough,
			resolveAll: resolveAllStrikethrough
		};
		if (single === null || single === void 0) single = true;
		return {
			text: { [126]: tokenizer },
			insideSpan: { null: [tokenizer] },
			attentionMarkers: { null: [126] }
		};
		function resolveAllStrikethrough(events, context) {
			let index = -1;
			while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "strikethroughSequenceTemporary" && events[index][1]._close) {
				let open = index;
				while (open--) if (events[open][0] === "exit" && events[open][1].type === "strikethroughSequenceTemporary" && events[open][1]._open && events[index][1].end.offset - events[index][1].start.offset === events[open][1].end.offset - events[open][1].start.offset) {
					events[index][1].type = "strikethroughSequence";
					events[open][1].type = "strikethroughSequence";
					const strikethrough = {
						type: "strikethrough",
						start: Object.assign({}, events[open][1].start),
						end: Object.assign({}, events[index][1].end)
					};
					const text2 = {
						type: "strikethroughText",
						start: Object.assign({}, events[open][1].end),
						end: Object.assign({}, events[index][1].start)
					};
					const nextEvents = [
						[
							"enter",
							strikethrough,
							context
						],
						[
							"enter",
							events[open][1],
							context
						],
						[
							"exit",
							events[open][1],
							context
						],
						[
							"enter",
							text2,
							context
						]
					];
					const insideSpan = context.parser.constructs.insideSpan.null;
					if (insideSpan) splice(nextEvents, nextEvents.length, 0, resolveAll(insideSpan, events.slice(open + 1, index), context));
					splice(nextEvents, nextEvents.length, 0, [
						[
							"exit",
							text2,
							context
						],
						[
							"enter",
							events[index][1],
							context
						],
						[
							"exit",
							events[index][1],
							context
						],
						[
							"exit",
							strikethrough,
							context
						]
					]);
					splice(events, open - 1, index - open + 3, nextEvents);
					index = open + nextEvents.length - 2;
					break;
				}
			}
			index = -1;
			while (++index < events.length) if (events[index][1].type === "strikethroughSequenceTemporary") events[index][1].type = "data";
			return events;
		}
		function tokenizeStrikethrough(effects, ok2, nok) {
			const previous2 = this.previous;
			const events = this.events;
			let size = 0;
			return start;
			function start(code2) {
				if (previous2 === 126 && events[events.length - 1][1].type !== "characterEscape") return nok(code2);
				effects.enter("strikethroughSequenceTemporary");
				return more(code2);
			}
			function more(code2) {
				const before = classifyCharacter(previous2);
				if (code2 === 126) {
					if (size > 1) return nok(code2);
					effects.consume(code2);
					size++;
					return more;
				}
				if (size < 2 && !single) return nok(code2);
				const token = effects.exit("strikethroughSequenceTemporary");
				const after = classifyCharacter(code2);
				token._open = !after || after === 2 && Boolean(before);
				token._close = !before || before === 2 && Boolean(after);
				return ok2(code2);
			}
		}
	}
	var StrikethroughExtension = class extends MarkExtension {
		processConvertedUnistNode(convertedNode) {
			return {
				children: [convertedNode],
				type: this.unistNodeName()
			};
		}
		proseMirrorInputRules(proseMirrorSchema) {
			return [new MarkInputRule(/~([^\s](?:.*[^\s~])?)~([^~])$/u, proseMirrorSchema.marks[this.proseMirrorMarkName()]), new MarkInputRule(/~~([^\s](?:.*[^\s])?)~~([\s\S])$/u, proseMirrorSchema.marks[this.proseMirrorMarkName()])];
		}
		proseMirrorMarkName() {
			return "strikethrough";
		}
		proseMirrorMarkSpec() {
			return {
				parseDOM: [
					{ tag: "s" },
					{ tag: "del" },
					{
						getAttrs: (value) => /(^|[\s])line-through([\s]|$)/u.test(value) && null,
						style: "text-decoration"
					}
				],
				toDOM() {
					return ["s", 0];
				}
			};
		}
		unifiedInitializationHook(processor) {
			return processor.use(buildUnifiedExtension([gfmStrikethrough()], [gfmStrikethroughFromMarkdown()], [gfmStrikethroughToMarkdown()]));
		}
		unistNodeName() {
			return "delete";
		}
		unistNodeToProseMirrorNodes(_node, proseMirrorSchema, convertedChildren) {
			return convertedChildren.map((child) => child.mark(child.marks.concat([proseMirrorSchema.marks[this.proseMirrorMarkName()].create()])));
		}
	};
	function blockquote(node2, _, state, info) {
		const exit = state.enter("blockquote");
		const tracker = state.createTracker(info);
		tracker.move("> ");
		tracker.shift(2);
		const value = state.indentLines(state.containerFlow(node2, tracker.current()), map$1);
		exit();
		return value;
	}
	function map$1(line, _, blank) {
		return ">" + (blank ? "" : " ") + line;
	}
	function patternInScope(stack, pattern) {
		return listInScope(stack, pattern.inConstruct, true) && !listInScope(stack, pattern.notInConstruct, false);
	}
	function listInScope(stack, list2, none) {
		if (typeof list2 === "string") list2 = [list2];
		if (!list2 || list2.length === 0) return none;
		let index = -1;
		while (++index < list2.length) if (stack.includes(list2[index])) return true;
		return false;
	}
	function hardBreak(_, _1, state, info) {
		let index = -1;
		while (++index < state.unsafe.length) if (state.unsafe[index].character === "\n" && patternInScope(state.stack, state.unsafe[index])) return /[ \t]/.test(info.before) ? "" : " ";
		return "\\\n";
	}
	function longestStreak(value, substring) {
		const source = String(value);
		let index = source.indexOf(substring);
		let expected = index;
		let count = 0;
		let max = 0;
		if (typeof substring !== "string") throw new TypeError("Expected substring");
		while (index !== -1) {
			if (index === expected) {
				if (++count > max) max = count;
			} else count = 1;
			expected = index + substring.length;
			index = source.indexOf(substring, expected);
		}
		return max;
	}
	function formatCodeAsIndented(node2, state) {
		return Boolean(state.options.fences === false && node2.value && !node2.lang && /[^ \r\n]/.test(node2.value) && !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(node2.value));
	}
	function checkFence(state) {
		const marker = state.options.fence || "`";
		if (marker !== "`" && marker !== "~") throw new Error("Cannot serialize code with `" + marker + "` for `options.fence`, expected `` ` `` or `~`");
		return marker;
	}
	function code(node2, _, state, info) {
		const marker = checkFence(state);
		const raw = node2.value || "";
		const suffix = marker === "`" ? "GraveAccent" : "Tilde";
		if (formatCodeAsIndented(node2, state)) {
			const exit2 = state.enter("codeIndented");
			const value2 = state.indentLines(raw, map);
			exit2();
			return value2;
		}
		const tracker = state.createTracker(info);
		const sequence = marker.repeat(Math.max(longestStreak(raw, marker) + 1, 3));
		const exit = state.enter("codeFenced");
		let value = tracker.move(sequence);
		if (node2.lang) {
			const subexit = state.enter(`codeFencedLang${suffix}`);
			value += tracker.move(state.safe(node2.lang, {
				before: value,
				after: " ",
				encode: ["`"],
				...tracker.current()
			}));
			subexit();
		}
		if (node2.lang && node2.meta) {
			const subexit = state.enter(`codeFencedMeta${suffix}`);
			value += tracker.move(" ");
			value += tracker.move(state.safe(node2.meta, {
				before: value,
				after: "\n",
				encode: ["`"],
				...tracker.current()
			}));
			subexit();
		}
		value += tracker.move("\n");
		if (raw) value += tracker.move(raw + "\n");
		value += tracker.move(sequence);
		exit();
		return value;
	}
	function map(line, _, blank) {
		return (blank ? "" : "    ") + line;
	}
	function checkQuote(state) {
		const marker = state.options.quote || "\"";
		if (marker !== "\"" && marker !== "'") throw new Error("Cannot serialize title with `" + marker + "` for `options.quote`, expected `\"`, or `'`");
		return marker;
	}
	function definition(node2, _, state, info) {
		const quote = checkQuote(state);
		const suffix = quote === "\"" ? "Quote" : "Apostrophe";
		const exit = state.enter("definition");
		let subexit = state.enter("label");
		const tracker = state.createTracker(info);
		let value = tracker.move("[");
		value += tracker.move(state.safe(state.associationId(node2), {
			before: value,
			after: "]",
			...tracker.current()
		}));
		value += tracker.move("]: ");
		subexit();
		if (!node2.url || /[\0- \u007F]/.test(node2.url)) {
			subexit = state.enter("destinationLiteral");
			value += tracker.move("<");
			value += tracker.move(state.safe(node2.url, {
				before: value,
				after: ">",
				...tracker.current()
			}));
			value += tracker.move(">");
		} else {
			subexit = state.enter("destinationRaw");
			value += tracker.move(state.safe(node2.url, {
				before: value,
				after: node2.title ? " " : "\n",
				...tracker.current()
			}));
		}
		subexit();
		if (node2.title) {
			subexit = state.enter(`title${suffix}`);
			value += tracker.move(" " + quote);
			value += tracker.move(state.safe(node2.title, {
				before: value,
				after: quote,
				...tracker.current()
			}));
			value += tracker.move(quote);
			subexit();
		}
		exit();
		return value;
	}
	function checkEmphasis(state) {
		const marker = state.options.emphasis || "*";
		if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize emphasis with `" + marker + "` for `options.emphasis`, expected `*`, or `_`");
		return marker;
	}
	function encodeCharacterReference(code2) {
		return "&#x" + code2.toString(16).toUpperCase() + ";";
	}
	function encodeInfo(outside, inside, marker) {
		const outsideKind = classifyCharacter(outside);
		const insideKind = classifyCharacter(inside);
		if (outsideKind === void 0) return insideKind === void 0 ? marker === "_" ? {
			inside: true,
			outside: true
		} : {
			inside: false,
			outside: false
		} : insideKind === 1 ? {
			inside: true,
			outside: true
		} : {
			inside: false,
			outside: true
		};
		if (outsideKind === 1) return insideKind === void 0 ? {
			inside: false,
			outside: false
		} : insideKind === 1 ? {
			inside: true,
			outside: true
		} : {
			inside: false,
			outside: false
		};
		return insideKind === void 0 ? {
			inside: false,
			outside: false
		} : insideKind === 1 ? {
			inside: true,
			outside: false
		} : {
			inside: false,
			outside: false
		};
	}
	emphasis.peek = emphasisPeek;
	function emphasis(node2, _, state, info) {
		const marker = checkEmphasis(state);
		const exit = state.enter("emphasis");
		const tracker = state.createTracker(info);
		const before = tracker.move(marker);
		let between = tracker.move(state.containerPhrasing(node2, {
			after: marker,
			before,
			...tracker.current()
		}));
		const betweenHead = between.charCodeAt(0);
		const open = encodeInfo(info.before.charCodeAt(info.before.length - 1), betweenHead, marker);
		if (open.inside) between = encodeCharacterReference(betweenHead) + between.slice(1);
		const betweenTail = between.charCodeAt(between.length - 1);
		const close = encodeInfo(info.after.charCodeAt(0), betweenTail, marker);
		if (close.inside) between = between.slice(0, -1) + encodeCharacterReference(betweenTail);
		const after = tracker.move(marker);
		exit();
		state.attentionEncodeSurroundingInfo = {
			after: close.outside,
			before: open.outside
		};
		return before + between + after;
	}
	function emphasisPeek(_, _1, state) {
		return state.options.emphasis || "*";
	}
	function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
		let reverse;
		let test;
		let visitor;
		if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
			test = void 0;
			visitor = testOrVisitor;
			reverse = visitorOrReverse;
		} else {
			test = testOrVisitor;
			visitor = visitorOrReverse;
			reverse = maybeReverse;
		}
		visitParents(tree, test, overload, reverse);
		function overload(node2, parents) {
			const parent = parents[parents.length - 1];
			const index = parent ? parent.children.indexOf(node2) : void 0;
			return visitor(node2, index, parent);
		}
	}
	var emptyOptions = {};
	function toString(value, options) {
		const settings = emptyOptions;
		return one(value, typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true, typeof settings.includeHtml === "boolean" ? settings.includeHtml : true);
	}
	function one(value, includeImageAlt, includeHtml) {
		if (node(value)) {
			if ("value" in value) return value.type === "html" && !includeHtml ? "" : value.value;
			if (includeImageAlt && "alt" in value && value.alt) return value.alt;
			if ("children" in value) return all(value.children, includeImageAlt, includeHtml);
		}
		if (Array.isArray(value)) return all(value, includeImageAlt, includeHtml);
		return "";
	}
	function all(values, includeImageAlt, includeHtml) {
		const result = [];
		let index = -1;
		while (++index < values.length) result[index] = one(values[index], includeImageAlt, includeHtml);
		return result.join("");
	}
	function node(value) {
		return Boolean(value && typeof value === "object");
	}
	function formatHeadingAsSetext(node2, state) {
		let literalWithBreak = false;
		visit(node2, function(node3) {
			if ("value" in node3 && /\r?\n|\r/.test(node3.value) || node3.type === "break") {
				literalWithBreak = true;
				return EXIT;
			}
		});
		return Boolean((!node2.depth || node2.depth < 3) && toString(node2) && (state.options.setext || literalWithBreak));
	}
	function heading(node2, _, state, info) {
		const rank = Math.max(Math.min(6, node2.depth || 1), 1);
		const tracker = state.createTracker(info);
		if (formatHeadingAsSetext(node2, state)) {
			const exit2 = state.enter("headingSetext");
			const subexit2 = state.enter("phrasing");
			const value2 = state.containerPhrasing(node2, {
				...tracker.current(),
				before: "\n",
				after: "\n"
			});
			subexit2();
			exit2();
			return value2 + "\n" + (rank === 1 ? "=" : "-").repeat(value2.length - (Math.max(value2.lastIndexOf("\r"), value2.lastIndexOf("\n")) + 1));
		}
		const sequence = "#".repeat(rank);
		const exit = state.enter("headingAtx");
		const subexit = state.enter("phrasing");
		tracker.move(sequence + " ");
		let value = state.containerPhrasing(node2, {
			before: "# ",
			after: "\n",
			...tracker.current()
		});
		if (/^[\t ]/.test(value)) value = encodeCharacterReference(value.charCodeAt(0)) + value.slice(1);
		value = value ? sequence + " " + value : sequence;
		if (state.options.closeAtx) value += " " + sequence;
		subexit();
		exit();
		return value;
	}
	html.peek = htmlPeek;
	function html(node2) {
		return node2.value || "";
	}
	function htmlPeek() {
		return "<";
	}
	image.peek = imagePeek;
	function image(node2, _, state, info) {
		const quote = checkQuote(state);
		const suffix = quote === "\"" ? "Quote" : "Apostrophe";
		const exit = state.enter("image");
		let subexit = state.enter("label");
		const tracker = state.createTracker(info);
		let value = tracker.move("![");
		value += tracker.move(state.safe(node2.alt, {
			before: value,
			after: "]",
			...tracker.current()
		}));
		value += tracker.move("](");
		subexit();
		if (!node2.url && node2.title || /[\0- \u007F]/.test(node2.url)) {
			subexit = state.enter("destinationLiteral");
			value += tracker.move("<");
			value += tracker.move(state.safe(node2.url, {
				before: value,
				after: ">",
				...tracker.current()
			}));
			value += tracker.move(">");
		} else {
			subexit = state.enter("destinationRaw");
			value += tracker.move(state.safe(node2.url, {
				before: value,
				after: node2.title ? " " : ")",
				...tracker.current()
			}));
		}
		subexit();
		if (node2.title) {
			subexit = state.enter(`title${suffix}`);
			value += tracker.move(" " + quote);
			value += tracker.move(state.safe(node2.title, {
				before: value,
				after: quote,
				...tracker.current()
			}));
			value += tracker.move(quote);
			subexit();
		}
		value += tracker.move(")");
		exit();
		return value;
	}
	function imagePeek() {
		return "!";
	}
	imageReference.peek = imageReferencePeek;
	function imageReference(node2, _, state, info) {
		const type = node2.referenceType;
		const exit = state.enter("imageReference");
		let subexit = state.enter("label");
		const tracker = state.createTracker(info);
		let value = tracker.move("![");
		const alt = state.safe(node2.alt, {
			before: value,
			after: "]",
			...tracker.current()
		});
		value += tracker.move(alt + "][");
		subexit();
		const stack = state.stack;
		state.stack = [];
		subexit = state.enter("reference");
		const reference = state.safe(state.associationId(node2), {
			before: value,
			after: "]",
			...tracker.current()
		});
		subexit();
		state.stack = stack;
		exit();
		if (type === "full" || !alt || alt !== reference) value += tracker.move(reference + "]");
		else if (type === "shortcut") value = value.slice(0, -1);
		else value += tracker.move("]");
		return value;
	}
	function imageReferencePeek() {
		return "!";
	}
	inlineCode.peek = inlineCodePeek;
	function inlineCode(node2, _, state) {
		let value = node2.value || "";
		let sequence = "`";
		let index = -1;
		while (new RegExp("(^|[^`])" + sequence + "([^`]|$)").test(value)) sequence += "`";
		if (/[^ \r\n]/.test(value) && (/^[ \r\n]/.test(value) && /[ \r\n]$/.test(value) || /^`|`$/.test(value))) value = " " + value + " ";
		while (++index < state.unsafe.length) {
			const pattern = state.unsafe[index];
			const expression = state.compilePattern(pattern);
			let match;
			if (!pattern.atBreak) continue;
			while (match = expression.exec(value)) {
				let position = match.index;
				if (value.charCodeAt(position) === 10 && value.charCodeAt(position - 1) === 13) position--;
				value = value.slice(0, position) + " " + value.slice(match.index + 1);
			}
		}
		return sequence + value + sequence;
	}
	function inlineCodePeek() {
		return "`";
	}
	function formatLinkAsAutolink(node2, state) {
		const raw = toString(node2);
		return Boolean(!state.options.resourceLink && node2.url && !node2.title && node2.children && node2.children.length === 1 && node2.children[0].type === "text" && (raw === node2.url || "mailto:" + raw === node2.url) && /^[a-z][a-z+.-]+:/i.test(node2.url) && !/[\0- <>\u007F]/.test(node2.url));
	}
	link.peek = linkPeek;
	function link(node2, _, state, info) {
		const quote = checkQuote(state);
		const suffix = quote === "\"" ? "Quote" : "Apostrophe";
		const tracker = state.createTracker(info);
		let exit;
		let subexit;
		if (formatLinkAsAutolink(node2, state)) {
			const stack = state.stack;
			state.stack = [];
			exit = state.enter("autolink");
			let value2 = tracker.move("<");
			value2 += tracker.move(state.containerPhrasing(node2, {
				before: value2,
				after: ">",
				...tracker.current()
			}));
			value2 += tracker.move(">");
			exit();
			state.stack = stack;
			return value2;
		}
		exit = state.enter("link");
		subexit = state.enter("label");
		let value = tracker.move("[");
		value += tracker.move(state.containerPhrasing(node2, {
			before: value,
			after: "](",
			...tracker.current()
		}));
		value += tracker.move("](");
		subexit();
		if (!node2.url && node2.title || /[\0- \u007F]/.test(node2.url)) {
			subexit = state.enter("destinationLiteral");
			value += tracker.move("<");
			value += tracker.move(state.safe(node2.url, {
				before: value,
				after: ">",
				...tracker.current()
			}));
			value += tracker.move(">");
		} else {
			subexit = state.enter("destinationRaw");
			value += tracker.move(state.safe(node2.url, {
				before: value,
				after: node2.title ? " " : ")",
				...tracker.current()
			}));
		}
		subexit();
		if (node2.title) {
			subexit = state.enter(`title${suffix}`);
			value += tracker.move(" " + quote);
			value += tracker.move(state.safe(node2.title, {
				before: value,
				after: quote,
				...tracker.current()
			}));
			value += tracker.move(quote);
			subexit();
		}
		value += tracker.move(")");
		exit();
		return value;
	}
	function linkPeek(node2, _, state) {
		return formatLinkAsAutolink(node2, state) ? "<" : "[";
	}
	linkReference.peek = linkReferencePeek;
	function linkReference(node2, _, state, info) {
		const type = node2.referenceType;
		const exit = state.enter("linkReference");
		let subexit = state.enter("label");
		const tracker = state.createTracker(info);
		let value = tracker.move("[");
		const text2 = state.containerPhrasing(node2, {
			before: value,
			after: "]",
			...tracker.current()
		});
		value += tracker.move(text2 + "][");
		subexit();
		const stack = state.stack;
		state.stack = [];
		subexit = state.enter("reference");
		const reference = state.safe(state.associationId(node2), {
			before: value,
			after: "]",
			...tracker.current()
		});
		subexit();
		state.stack = stack;
		exit();
		if (type === "full" || !text2 || text2 !== reference) value += tracker.move(reference + "]");
		else if (type === "shortcut") value = value.slice(0, -1);
		else value += tracker.move("]");
		return value;
	}
	function linkReferencePeek() {
		return "[";
	}
	function checkBullet(state) {
		const marker = state.options.bullet || "*";
		if (marker !== "*" && marker !== "+" && marker !== "-") throw new Error("Cannot serialize items with `" + marker + "` for `options.bullet`, expected `*`, `+`, or `-`");
		return marker;
	}
	function checkBulletOther(state) {
		const bullet = checkBullet(state);
		const bulletOther = state.options.bulletOther;
		if (!bulletOther) return bullet === "*" ? "-" : "*";
		if (bulletOther !== "*" && bulletOther !== "+" && bulletOther !== "-") throw new Error("Cannot serialize items with `" + bulletOther + "` for `options.bulletOther`, expected `*`, `+`, or `-`");
		if (bulletOther === bullet) throw new Error("Expected `bullet` (`" + bullet + "`) and `bulletOther` (`" + bulletOther + "`) to be different");
		return bulletOther;
	}
	function checkBulletOrdered(state) {
		const marker = state.options.bulletOrdered || ".";
		if (marker !== "." && marker !== ")") throw new Error("Cannot serialize items with `" + marker + "` for `options.bulletOrdered`, expected `.` or `)`");
		return marker;
	}
	function checkRule(state) {
		const marker = state.options.rule || "*";
		if (marker !== "*" && marker !== "-" && marker !== "_") throw new Error("Cannot serialize rules with `" + marker + "` for `options.rule`, expected `*`, `-`, or `_`");
		return marker;
	}
	function list(node2, parent, state, info) {
		const exit = state.enter("list");
		const bulletCurrent = state.bulletCurrent;
		let bullet = node2.ordered ? checkBulletOrdered(state) : checkBullet(state);
		const bulletOther = node2.ordered ? bullet === "." ? ")" : "." : checkBulletOther(state);
		let useDifferentMarker = parent && state.bulletLastUsed ? bullet === state.bulletLastUsed : false;
		if (!node2.ordered) {
			const firstListItem = node2.children ? node2.children[0] : void 0;
			if ((bullet === "*" || bullet === "-") && firstListItem && (!firstListItem.children || !firstListItem.children[0]) && state.stack[state.stack.length - 1] === "list" && state.stack[state.stack.length - 2] === "listItem" && state.stack[state.stack.length - 3] === "list" && state.stack[state.stack.length - 4] === "listItem" && state.indexStack[state.indexStack.length - 1] === 0 && state.indexStack[state.indexStack.length - 2] === 0 && state.indexStack[state.indexStack.length - 3] === 0) useDifferentMarker = true;
			if (checkRule(state) === bullet && firstListItem) {
				let index = -1;
				while (++index < node2.children.length) {
					const item = node2.children[index];
					if (item && item.type === "listItem" && item.children && item.children[0] && item.children[0].type === "thematicBreak") {
						useDifferentMarker = true;
						break;
					}
				}
			}
		}
		if (useDifferentMarker) bullet = bulletOther;
		state.bulletCurrent = bullet;
		const value = state.containerFlow(node2, info);
		state.bulletLastUsed = bullet;
		state.bulletCurrent = bulletCurrent;
		exit();
		return value;
	}
	function checkListItemIndent(state) {
		const style = state.options.listItemIndent || "one";
		if (style !== "tab" && style !== "one" && style !== "mixed") throw new Error("Cannot serialize items with `" + style + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");
		return style;
	}
	function listItem(node2, parent, state, info) {
		const listItemIndent = checkListItemIndent(state);
		let bullet = state.bulletCurrent || checkBullet(state);
		if (parent && parent.type === "list" && parent.ordered) bullet = (typeof parent.start === "number" && parent.start > -1 ? parent.start : 1) + (state.options.incrementListMarker === false ? 0 : parent.children.indexOf(node2)) + bullet;
		let size = bullet.length + 1;
		if (listItemIndent === "tab" || listItemIndent === "mixed" && (parent && parent.type === "list" && parent.spread || node2.spread)) size = Math.ceil(size / 4) * 4;
		const tracker = state.createTracker(info);
		tracker.move(bullet + " ".repeat(size - bullet.length));
		tracker.shift(size);
		const exit = state.enter("listItem");
		const value = state.indentLines(state.containerFlow(node2, tracker.current()), map2);
		exit();
		return value;
		function map2(line, index, blank) {
			if (index) return (blank ? "" : " ".repeat(size)) + line;
			return (blank ? bullet : bullet + " ".repeat(size - bullet.length)) + line;
		}
	}
	function paragraph(node2, _, state, info) {
		const exit = state.enter("paragraph");
		const subexit = state.enter("phrasing");
		const value = state.containerPhrasing(node2, info);
		subexit();
		exit();
		return value;
	}
	var phrasing = convert([
		"break",
		"delete",
		"emphasis",
		"footnote",
		"footnoteReference",
		"image",
		"imageReference",
		"inlineCode",
		"inlineMath",
		"link",
		"linkReference",
		"mdxJsxTextElement",
		"mdxTextExpression",
		"strong",
		"text",
		"textDirective"
	]);
	function root(node2, _, state, info) {
		return (node2.children.some(function(d) {
			return phrasing(d);
		}) ? state.containerPhrasing : state.containerFlow).call(state, node2, info);
	}
	function checkStrong(state) {
		const marker = state.options.strong || "*";
		if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize strong with `" + marker + "` for `options.strong`, expected `*`, or `_`");
		return marker;
	}
	strong.peek = strongPeek;
	function strong(node2, _, state, info) {
		const marker = checkStrong(state);
		const exit = state.enter("strong");
		const tracker = state.createTracker(info);
		const before = tracker.move(marker + marker);
		let between = tracker.move(state.containerPhrasing(node2, {
			after: marker,
			before,
			...tracker.current()
		}));
		const betweenHead = between.charCodeAt(0);
		const open = encodeInfo(info.before.charCodeAt(info.before.length - 1), betweenHead, marker);
		if (open.inside) between = encodeCharacterReference(betweenHead) + between.slice(1);
		const betweenTail = between.charCodeAt(between.length - 1);
		const close = encodeInfo(info.after.charCodeAt(0), betweenTail, marker);
		if (close.inside) between = between.slice(0, -1) + encodeCharacterReference(betweenTail);
		const after = tracker.move(marker + marker);
		exit();
		state.attentionEncodeSurroundingInfo = {
			after: close.outside,
			before: open.outside
		};
		return before + between + after;
	}
	function strongPeek(_, _1, state) {
		return state.options.strong || "*";
	}
	function text(node2, _, state, info) {
		return state.safe(node2.value, info);
	}
	function checkRuleRepetition(state) {
		const repetition = state.options.ruleRepetition || 3;
		if (repetition < 3) throw new Error("Cannot serialize rules with repetition `" + repetition + "` for `options.ruleRepetition`, expected `3` or more");
		return repetition;
	}
	function thematicBreak(_, _1, state) {
		const value = (checkRule(state) + (state.options.ruleSpaces ? " " : "")).repeat(checkRuleRepetition(state));
		return state.options.ruleSpaces ? value.slice(0, -1) : value;
	}
	var handle = {
		blockquote,
		break: hardBreak,
		code,
		definition,
		emphasis,
		hardBreak,
		heading,
		html,
		image,
		imageReference,
		inlineCode,
		link,
		linkReference,
		list,
		listItem,
		paragraph,
		root,
		strong,
		text,
		thematicBreak
	};
	function gfmTaskListItemFromMarkdown() {
		return { exit: {
			taskListCheckValueChecked: exitCheck,
			taskListCheckValueUnchecked: exitCheck,
			paragraph: exitParagraphWithTaskListItem
		} };
	}
	function gfmTaskListItemToMarkdown() {
		return {
			unsafe: [{
				atBreak: true,
				character: "-",
				after: "[:|-]"
			}],
			handlers: { listItem: listItemWithTaskListItem }
		};
	}
	function exitCheck(token) {
		const node2 = this.stack[this.stack.length - 2];
		node2.type;
		node2.checked = token.type === "taskListCheckValueChecked";
	}
	function exitParagraphWithTaskListItem(token) {
		const parent = this.stack[this.stack.length - 2];
		if (parent && parent.type === "listItem" && typeof parent.checked === "boolean") {
			const node2 = this.stack[this.stack.length - 1];
			node2.type;
			const head = node2.children[0];
			if (head && head.type === "text") {
				const siblings = parent.children;
				let index = -1;
				let firstParaghraph;
				while (++index < siblings.length) {
					const sibling = siblings[index];
					if (sibling.type === "paragraph") {
						firstParaghraph = sibling;
						break;
					}
				}
				if (firstParaghraph === node2) {
					head.value = head.value.slice(1);
					if (head.value.length === 0) node2.children.shift();
					else if (node2.position && head.position && typeof head.position.start.offset === "number") {
						head.position.start.column++;
						head.position.start.offset++;
						node2.position.start = Object.assign({}, head.position.start);
					}
				}
			}
		}
		this.exit(token);
	}
	function listItemWithTaskListItem(node2, parent, state, info) {
		const head = node2.children[0];
		const checkable = typeof node2.checked === "boolean" && head && head.type === "paragraph";
		const checkbox = "[" + (node2.checked ? "x" : " ") + "] ";
		const tracker = state.createTracker(info);
		if (checkable) tracker.move(checkbox);
		let value = handle.listItem(node2, parent, state, {
			...info,
			...tracker.current()
		});
		if (checkable) value = value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, check);
		return value;
		function check($0) {
			return $0 + checkbox;
		}
	}
	function factorySpace(effects, ok2, type, max) {
		const limit = Number.POSITIVE_INFINITY;
		let size = 0;
		return start;
		function start(code2) {
			if (markdownSpace(code2)) {
				effects.enter(type);
				return prefix(code2);
			}
			return ok2(code2);
		}
		function prefix(code2) {
			if (markdownSpace(code2) && size++ < limit) {
				effects.consume(code2);
				return prefix;
			}
			effects.exit(type);
			return ok2(code2);
		}
	}
	var tasklistCheck = {
		name: "tasklistCheck",
		tokenize: tokenizeTasklistCheck
	};
	function gfmTaskListItem() {
		return { text: { [91]: tasklistCheck } };
	}
	function tokenizeTasklistCheck(effects, ok2, nok) {
		const self = this;
		return open;
		function open(code2) {
			if (self.previous !== null || !self._gfmTasklistFirstContentOfListItem) return nok(code2);
			effects.enter("taskListCheck");
			effects.enter("taskListCheckMarker");
			effects.consume(code2);
			effects.exit("taskListCheckMarker");
			return inside;
		}
		function inside(code2) {
			if (markdownLineEndingOrSpace(code2)) {
				effects.enter("taskListCheckValueUnchecked");
				effects.consume(code2);
				effects.exit("taskListCheckValueUnchecked");
				return close;
			}
			if (code2 === 88 || code2 === 120) {
				effects.enter("taskListCheckValueChecked");
				effects.consume(code2);
				effects.exit("taskListCheckValueChecked");
				return close;
			}
			return nok(code2);
		}
		function close(code2) {
			if (code2 === 93) {
				effects.enter("taskListCheckMarker");
				effects.consume(code2);
				effects.exit("taskListCheckMarker");
				effects.exit("taskListCheck");
				return after;
			}
			return nok(code2);
		}
		function after(code2) {
			if (markdownLineEnding(code2)) return ok2(code2);
			if (markdownSpace(code2)) return effects.check({ tokenize: spaceThenNonSpace }, ok2, nok)(code2);
			return nok(code2);
		}
	}
	function spaceThenNonSpace(effects, ok2, nok) {
		return factorySpace(effects, after, "whitespace");
		function after(code2) {
			return code2 === null ? nok(code2) : ok2(code2);
		}
	}
	var TaskListItemView = class {
		constructor(node2, view, getPos) {
			const checkbox = document.createElement("input");
			checkbox.setAttribute("type", "checkbox");
			checkbox.setAttribute("style", "cursor: pointer;");
			if (node2.attrs["checked"] === true) checkbox.setAttribute("checked", "checked");
			checkbox.addEventListener("click", (e) => {
				const pos = getPos();
				if (pos === void 0) return;
				e.preventDefault();
				view.dispatch(view.state.tr.setNodeAttribute(pos, "checked", !node2.attrs["checked"]));
			});
			const checkboxContainer = document.createElement("span");
			checkboxContainer.setAttribute("contenteditable", "false");
			checkboxContainer.setAttribute("style", "position: absolute; left: 5px;");
			checkboxContainer.appendChild(checkbox);
			this.contentDOM = document.createElement("span");
			this.contentDOM.setAttribute("style", "position: relative; left: 30px;");
			this.dom = document.createElement("li");
			this.dom.setAttribute("style", "list-style-type: none; margin-left: -30px;");
			this.dom.appendChild(checkboxContainer);
			this.dom.appendChild(this.contentDOM);
		}
		stopEvent() {
			return true;
		}
	};
	var TaskListItemExtension = class TaskListItemExtension extends NodeExtension {
		static isAtStart(state, view) {
			if (!state.selection.empty) return false;
			if (view !== void 0) return view.endOfTextblock("backward", state);
			return state.selection.$anchor.parentOffset > 0;
		}
		proseMirrorInputRules(proseMirrorSchema) {
			return [new InputRule(/^\[([x\s]?)\][\s\S]$/u, (state, match, start) => {
				const wrappingNode = state.doc.resolve(start).node(-1);
				if (wrappingNode.type.name !== "regular_list_item") return null;
				return state.tr.replaceRangeWith(start - 2, start + wrappingNode.nodeSize, proseMirrorSchema.nodes[this.proseMirrorNodeName()].create({ checked: match[1] === "x" }, wrappingNode.content.cut(3 + match[1].length)));
			})];
		}
		proseMirrorKeymap(proseMirrorSchema) {
			return { Backspace: (state, dispatch, view) => {
				if (!TaskListItemExtension.isAtStart(state, view)) return false;
				const taskListItemNode = state.selection.$anchor.node(-1);
				if (taskListItemNode.type.name !== "task_list_item") return false;
				if (dispatch === void 0) return true;
				dispatch(state.tr.replaceRangeWith(state.selection.$from.before() - 2, state.selection.$from.before() + taskListItemNode.nodeSize, proseMirrorSchema.nodes["regular_list_item"].create({}, taskListItemNode.content)));
				return true;
			} };
		}
		proseMirrorNodeName() {
			return "task_list_item";
		}
		proseMirrorNodeSpec() {
			return {
				attrs: { checked: { default: false } },
				content: "paragraph block*",
				defining: true,
				group: "list_item",
				parseDOM: [{
					getAttrs(dom) {
						const checkbox = dom.firstChild;
						if (!(checkbox instanceof HTMLInputElement)) return false;
						return { checked: checkbox.checked };
					},
					tag: "li"
				}],
				toDOM(node2) {
					return [
						"li",
						{ style: "list-style-type: none;, margin-left: -30px;" },
						[
							"span",
							{
								contenteditable: "false",
								style: "position: absolute; left: 5px;"
							},
							["input", {
								checked: node2.attrs["checked"] ? "checked" : void 0,
								disabled: "disabled",
								type: "checkbox"
							}]
						],
						[
							"span",
							{ style: "position: relative; left: 30px" },
							0
						]
					];
				}
			};
		}
		proseMirrorNodeToUnistNodes(node2, convertedChildren) {
			return [{
				checked: node2.attrs["checked"],
				children: convertedChildren,
				type: this.unistNodeName()
			}];
		}
		proseMirrorNodeView() {
			return (node2, view, getPos) => new TaskListItemView(node2, view, getPos);
		}
		unifiedInitializationHook(processor) {
			return processor.use(buildUnifiedExtension([gfmTaskListItem()], [gfmTaskListItemFromMarkdown()], [gfmTaskListItemToMarkdown()]));
		}
		unistNodeName() {
			return "listItem";
		}
		unistNodeToProseMirrorNodes(node2, proseMirrorSchema, convertedChildren) {
			return createProseMirrorNode(this.proseMirrorNodeName(), proseMirrorSchema, convertedChildren, { checked: node2.checked });
		}
		unistToProseMirrorTest(node2) {
			return node2.type === this.unistNodeName() && "checked" in node2 && typeof node2.checked === "boolean";
		}
	};
	var GFMExtension = class extends Extension {
		dependencies() {
			return [
				new MarkdownExtension(),
				new ExtendedAutolinkExtension(),
				new StrikethroughExtension(),
				new TaskListItemExtension()
			];
		}
	};
	//#endregion
	//#region src/editor.js
	var pmu = new ProseMirrorUnified([new GFMExtension()]);
	function markdownToProseMirror(markdown) {
		return pmu.parse(markdown);
	}
	function proseMirrorToMarkdown(doc) {
		return pmu.serialize(doc);
	}
	var mySchema = pmu.schema();
	window.ProseMirrorBundle = {
		Schema,
		EditorState,
		EditorView,
		undo,
		redo,
		keymap,
		history,
		baseKeymap,
		toggleMark,
		wrapIn,
		setBlockType,
		lift,
		mySchema,
		markdownToProseMirror,
		proseMirrorToMarkdown
	};
	//#endregion
})();
