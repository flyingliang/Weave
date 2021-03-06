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

package weave.data.BinningDefinitions
{
	import weave.api.core.ICallbackCollection;
	import weave.api.data.IAttributeColumn;
	import weave.api.data.IBinningDefinition;
	import weave.api.getCallbackCollection;
	import weave.api.newDisposableChild;
	import weave.api.newLinkableChild;
	import weave.core.LinkableDynamicObject;
	import weave.core.LinkableWatcher;
	
	/**
	 * This provides a wrapper for a dynamically created IBinningDefinition.
	 * When <code>generateBinClassifiersForColumn(column)</code> is called, the column
	 * will be monitored for changes and results will be computed automatically.
	 */
	public class DynamicBinningDefinition extends LinkableDynamicObject implements IBinningDefinition
	{
		/**
		 * @param lockFirstColumn If set to true, the first column passed to <code>generateBinClassifiersForColumn()</code> will be the only column accepted.
		 */
		public function DynamicBinningDefinition(lockFirstColumn:Boolean = false)
		{
			super(IBinningDefinition);
			addImmediateCallback(null, watchInternalObject);
			_columnLocked = lockFirstColumn;
		}
		
		private var _columnLocked:Boolean = false;
		private const internalResultWatcher:LinkableWatcher = newDisposableChild(this, LinkableWatcher);
		private const internalObjectWatcher:LinkableWatcher = newLinkableChild(this, LinkableWatcher, handleInternalObjectChange);
		private const columnWatcher:LinkableWatcher = newLinkableChild(this, LinkableWatcher, generateBins);
		private const statsWatcher:LinkableWatcher = newLinkableChild(this, LinkableWatcher, generateBins);
		
		private function watchInternalObject():void
		{
			internalObjectWatcher.target = internalObject;
		}
		
		private function handleInternalObjectChange():void
		{
			if (internalObject)
				internalResultWatcher.target = (internalObject as IBinningDefinition).asyncResultCallbacks
			generateBins();
		}
		
		private var _updatingTargets:Boolean = false;
		private function generateBins():void
		{
			// prevent recursion if this function is called as a result of updating targets
			if (_updatingTargets)
				return;
			_updatingTargets = true;
			
			var column:IAttributeColumn = columnWatcher.target as IAttributeColumn;
			statsWatcher.target = column ? WeaveAPI.StatisticsCache.getColumnStatistics(column) : null;
			
			_updatingTargets = false; // done preventing recursion
			
			if (internalObject && column)
				(internalObject as IBinningDefinition).generateBinClassifiersForColumn(column);
			else
				asyncResultCallbacks.triggerCallbacks(); // bins are empty
		}
		
		/**
		 * @inheritDoc
		 */
		public function get asyncResultCallbacks():ICallbackCollection
		{
			return getCallbackCollection(internalResultWatcher);
		}

		/**
		 * @inheritDoc
		 */
		public function generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			if (_columnLocked && columnWatcher.target)
				throw new Error("generateBinClassifiersForColumn(): Column was locked upon creation of this DynamicBinningDefinition.");
			columnWatcher.target = column;
		}
		
		/**
		 * @inheritDoc
		 */
		public function getBinClassifiers():Array
		{
			if (internalObject && columnWatcher.target)
				return (internalObject as IBinningDefinition).getBinClassifiers();
			return [];
		}
		
		/**
		 * @inheritDoc
		 */
		public function getBinNames():Array
		{
			if (internalObject && columnWatcher.target)
				return (internalObject as IBinningDefinition).getBinNames();
			return [];
		}
	}
}
