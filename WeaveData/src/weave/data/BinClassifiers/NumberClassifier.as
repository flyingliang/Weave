/*
    Weave (Web-based Analysis and Visualization Environment)
    Copyright (C) 2008-2011 University of Massachusetts Lowell

    This file is a part of Weave.

    Weave is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License, Version 3,
    as published by the Free Software Foundation.

    Weave is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Weave.  If not, see <http://www.gnu.org/licenses/>.
*/

package weave.data.BinClassifiers
{
	import weave.api.core.ICallbackCollection;
	import weave.api.data.ColumnMetadata;
	import weave.api.data.DataType;
	import weave.api.data.IAttributeColumn;
	import weave.api.data.IBinClassifier;
	import weave.api.data.IPrimitiveColumn;
	import weave.api.getCallbackCollection;
	import weave.api.newLinkableChild;
	import weave.compiler.StandardLib;
	import weave.core.LinkableBoolean;
	import weave.core.LinkableNumber;
	import weave.data.AttributeColumns.StringColumn;
	import weave.utils.ColumnUtils;
	
	/**
	 * A classifier that uses min,max values for containment tests.
	 * 
	 * @author adufilie
	 */
	public class NumberClassifier implements IBinClassifier
	{
		public function NumberClassifier(min:* = NaN, max:* = NaN, minInclusive:Boolean = true, maxInclusive:Boolean = true)
		{
			super();
			_callbacks = getCallbackCollection(this);
			this.min.value = min;
			this.max.value = max;
			this.minInclusive.value = minInclusive;
			this.maxInclusive.value = maxInclusive;
		}

		/**
		 * These values define the bounds of the continuous range contained in this classifier.
		 */
		public const min:LinkableNumber = newLinkableChild(this, LinkableNumber);
		public const max:LinkableNumber = newLinkableChild(this, LinkableNumber);

		/**
		 * This value is the result of contains(value) when value == min.
		 */
		public const minInclusive:LinkableBoolean = newLinkableChild(this, LinkableBoolean);
		/**
		 * This value is the result of contains(value) when value == max.
		 */
		public const maxInclusive:LinkableBoolean = newLinkableChild(this, LinkableBoolean);

		// private variables for holding session state, used for speed
		private var _callbacks:ICallbackCollection;
		private var _triggerCount:uint = 0;
		private var _min:Number, _max:Number;
		private var _minInclusive:Boolean, _maxInclusive:Boolean;

		/**
		 * contains
		 * @param value A value to test.
		 * @return true If this IBinClassifier contains the given value.
		 */
		public function contains(value:*):Boolean
		{
			// validate private variables before trying to use them
			if (_triggerCount != _callbacks.triggerCounter)
			{
				_min = min.value;
				_max = max.value;
				_minInclusive = minInclusive.value;
				_maxInclusive = maxInclusive.value;
				_triggerCount = _callbacks.triggerCounter;
			}
			// use private variables for speed
			return (_minInclusive ? value >= _min : value > _min)
				&& (_maxInclusive ? value <= _max : value < _max);
		}
		
		/**
		 * @param toStringColumn The primitive column to use that provides a number-to-string conversion function.
		 * @return A generated label for this NumberClassifier.
		 */
		public function generateBinLabel(toStringColumn:IAttributeColumn = null):String
		{
			var minStr:String = null;
			var maxStr:String = null;
			
			// get labels from column
			minStr = ColumnUtils.deriveStringFromNumber(toStringColumn, min.value) || '';
			maxStr = ColumnUtils.deriveStringFromNumber(toStringColumn, max.value) || '';
			
			// if the column produced no labels, use default number formatting
			if (!minStr && !maxStr)
			{
				minStr = StandardLib.formatNumber(min.value);
				maxStr = StandardLib.formatNumber(max.value);
			}
			
			// if both labels are the same, return the label
			if (minStr && maxStr && minStr == maxStr)
				return minStr;
			
			// if the column dataType is string, put quotes around the labels
			if (toStringColumn && toStringColumn.getMetadata(ColumnMetadata.DATA_TYPE) == DataType.STRING)
			{
				minStr = lang('"{0}"', minStr);
				maxStr = lang('"{0}"', maxStr);
			}
			else
			{
				if (!minInclusive.value)
					minStr = lang("> {0}", minStr);
				if (!maxInclusive.value)
					maxStr = lang("< {0}", maxStr);
			}

			if (minStr == '')
				minStr = lang('Undefined');
			if (maxStr == '')
				maxStr = lang('Undefined');
			
			return lang("{0} to {1}", minStr, maxStr);
		}
		
		public function toString():String
		{
			return (minInclusive.value ? '[' : '(')
				+ min.value + ', ' + max.value
				+ (maxInclusive.value ? ']' : ')');
		}
	}
}
