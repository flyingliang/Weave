/*
	Weave (Web-based Analysis and Visualization Environment)
	Copyright (C) 2008-2011 University of Massachusetts Lowell
	
	This file is a part of Weave.
	
	Weave is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License, Version 3,
	as published by the Free Software Foundation.
	
	Weave is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU General Public License for more details.
	
	You should have received a copy of the GNU General Public License
	along with Weave. If not, see <http://www.gnu.org/licenses/>.
*/

package weave.ui
{
	import flash.utils.Dictionary;
	
	import mx.core.IVisualElement;
	
	import spark.components.Group;
	
	import weave.api.core.IDisposableObject;
	import weave.api.getCallbackCollection;
	import weave.api.ui.ILinkableLayoutManager;
	import weave.compiler.StandardLib;

	/**
	 * This is a basic implementation for ILinkableLayoutManager.
	 * 
	 * @author adufilie
	 */
	public class BasicLinkableLayoutManager extends Group implements ILinkableLayoutManager, IDisposableObject
	{
		public function BasicLinkableLayoutManager()
		{
			percentWidth = 100;
			percentHeight = 100;
		}
		
		private var _idToComponent:Object = {}; // String -> IVisualElement
		private var _componentToId:Dictionary = new Dictionary(true); // IVisualElement -> String
		
		/**
		 * Adds a component to the layout.
		 * @param id A unique identifier for the component.
		 * @param component The component to add to the layout.
		 */		
		public function addComponent(id:String, component:IVisualElement):void
		{
			if (!id)
				throw new Error("id cannot be null or empty String");
			if (_idToComponent[id] != component)
			{
				if (_idToComponent[id])
					throw new Error("id already exists: " + id);
				_idToComponent[id] = component;
				_componentToId[component] = id;
				if (component.parent != this)
					addElement(component);
				getCallbackCollection(this).triggerCallbacks();
			}
		}
		
		/**
		 * Removes a component from the layout.
		 * @param id The id of the component to remove.
		 */
		public function removeComponent(id:String):void
		{
			var component:IVisualElement = _idToComponent[id] as IVisualElement;
			if (component)
			{
				delete _idToComponent[id];
				delete _componentToId[component];
				if (component.parent == this)
					this.removeElement(component);
				getCallbackCollection(this).triggerCallbacks();
			}
		}
		
		/**
		 * Reorders the components. 
		 * @param orderedIds An ordered list of ids.
		 */
		public function setComponentOrder(orderedIds:Array):void
		{
			// do nothing if order didn't change
			if (StandardLib.compare(orderedIds, getComponentOrder()) == 0)
				return;
			
			getCallbackCollection(this).delayCallbacks();
			getCallbackCollection(this).triggerCallbacks();
			var childIndex:int = 0;
			for each (var id:String in orderedIds)
			{
				var component:IVisualElement = _idToComponent[id] as IVisualElement;
				if (component && component.parent == this)
					this.setElementIndex(component, childIndex++);
			}
			getCallbackCollection(this).resumeCallbacks();
		}
		
		/**
		 * This is an ordered list of ids in the layout.
		 */		
		public function getComponentOrder():Array
		{
			var result:Array = [];
			for (var index:int = 0; index < this.numElements; index++)
			{
				var component:IVisualElement = getElementAt(index);
				var id:String = _componentToId[component];
				if (id)
					result.push(id);
			}
			return result;
		}
		
		/**
		 * This function can be used to check if a component still exists in the layout.
		 */		
		public function hasComponent(id:String):Boolean
		{
			return _idToComponent[id] is IVisualElement;
		}
		
		/**
		 * This is called when the object is disposed.
		 */
		public function dispose():void
		{
			getCallbackCollection(this).delayCallbacks();
			
			for each (var id:String in getComponentOrder())
				removeComponent(id);
				
			getCallbackCollection(this).resumeCallbacks();
		}
	}
}