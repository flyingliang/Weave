/* ***** BEGIN LICENSE BLOCK *****
 *
 * This file is part of the Weave API.
 *
 * The Initial Developer of the Weave API is the Institute for Visualization
 * and Perception Research at the University of Massachusetts Lowell.
 * Portions created by the Initial Developer are Copyright (C) 2008-2012
 * the Initial Developer. All Rights Reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/.
 * 
 * ***** END LICENSE BLOCK ***** */

package weave.api.core
{
	/**
	 * Allows a reviewSessionState() function to be defined which will receive
	 * the full session state for the ILinkableObject 
	 */
	public interface ILinkableObjectWithNewProperties extends ILinkableObject
	{
		/**
		 * This function will be called by SessionManager.setSessionState()
		 * to give this object a chance to determine if a missing property
		 * should be derived using backwards compatibility code for old
		 * session states from when the property did not exist.
		 * @param newState The new session state for this object.
		 * @param missingProperty The name of the missing property.
		 */
		function handleMissingSessionStateProperty(newState:Object, missingProperty:String):void;
	}
}
