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
	import weave.api.data.IAttributeColumn;
	import weave.api.data.IColumnStatistics;
	import weave.api.registerLinkableChild;
	import weave.compiler.StandardLib;
	import weave.core.LinkableNumber;
	import weave.data.BinClassifiers.NumberClassifier;
	
	/**
	 * EqualIntervalBinningDefinition
	 * 
	 * @author adufilie
	 * @author abaumann
	 * @author sanbalagan
	 */
	public class EqualIntervalBinningDefinition extends AbstractBinningDefinition
	{
		public function EqualIntervalBinningDefinition()
		{
			super(true, true);
		}
		
		public const dataInterval:LinkableNumber = registerLinkableChild(this, new LinkableNumber());
		
		override public function generateBinClassifiersForColumn(column:IAttributeColumn):void
		{
			var name:String;
			// clear any existing bin classifiers
			output.removeAllObjects();
			
			//var integerValuesOnly:Boolean = column is StringColumn;
			var stats:IColumnStatistics = WeaveAPI.StatisticsCache.getColumnStatistics(column);
			var dataMin:Number = isFinite(overrideInputMin.value) ? overrideInputMin.value : stats.getMin();
			var dataMax:Number = isFinite(overrideInputMax.value) ? overrideInputMax.value : stats.getMax();
			var binMin:Number;
			var binMax:Number = dataMin;
			var maxInclusive:Boolean;
			//var valuesPerBin:int = Math.ceil((dataMax - dataMin + 1) / dataInterval.value);
			var numberOfBins:int = Math.ceil((dataMax - dataMin) / dataInterval.value);
			
			for (var iBin:int = 0; iBin < numberOfBins; iBin++)
			{
				
					// classifiers use min <= value < max,
					// except for the final one, which uses min <= value <= max
					binMin = binMax;
					if (iBin == numberOfBins - 1)
					{
						binMax = dataMax;
						maxInclusive = true;
					}
					else
					{
						maxInclusive = false;
						
						//****binMax = dataMin + (iBin + 1) * (dataMax - dataMin) / numberOfBins.value;
						binMax = binMin + dataInterval.value;
						// TEMPORARY SOLUTION -- round bin boundaries
						binMax = StandardLib.roundSignificant(binMax, 4);
					}
					
					// TEMPORARY SOLUTION -- round bin boundaries
					if (iBin > 0)
						binMin = StandardLib.roundSignificant(binMin, 4);
					
					// skip bins with no values
					if (binMin == binMax && !maxInclusive)
						continue;
				tempNumberClassifier.min.value = binMin;
				tempNumberClassifier.max.value = binMax;
				tempNumberClassifier.minInclusive.value = true;
				tempNumberClassifier.maxInclusive.value = maxInclusive;
				
				//first get name from overrideBinNames
				name = getOverrideNames()[iBin];
				//if it is empty string set it from generateBinLabel
				if(!name)
					name = tempNumberClassifier.generateBinLabel(column);
				output.requestObjectCopy(name, tempNumberClassifier);
			}
			
			// trigger callbacks now because we're done updating the output
			asyncResultCallbacks.triggerCallbacks();
		}
		
		// reusable temporary object
		private static const tempNumberClassifier:NumberClassifier = new NumberClassifier();
	}
}
