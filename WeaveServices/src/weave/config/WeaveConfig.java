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

package weave.config;

import java.io.File;
import java.rmi.RemoteException;

import weave.utils.BulkSQLLoader;
import weave.utils.MapUtils;
import weave.utils.ProgressManager;

/**
 * @author adufilie
 */
public class WeaveConfig
{
	private static WeaveContextParams weaveContextParams = null;
	private static ConnectionConfig _connConfig;
	private static DataConfig _dataConfig;
	
	public static void initWeaveConfig(WeaveContextParams wcp)
	{
		if (weaveContextParams == null)
		{
			weaveContextParams = wcp;
			BulkSQLLoader.temporaryFilesDirectory = new File(getUploadPath());
		}
	}
	
	public static WeaveContextParams getWeaveContextParams()
	{
		return weaveContextParams;
	}
	
	public static final String ALLOW_R_SCRIPT_ACCESS = "allow-r-script-access";
	public static final String ALLOW_RSERVE_ROOT_ACCESS = "allow-rserve-root-access";
	private static LiveProperties properties;
	public static String getProperty(String key)
	{
		if (properties == null)
		{
			if (weaveContextParams == null)
				return null;
			properties = new LiveProperties(
				new File(weaveContextParams.getConfigPath(), "config.properties"),
				MapUtils.<String,String>fromPairs(
					ALLOW_R_SCRIPT_ACCESS, "false"
				)
			);
		}
		return properties.getProperty(key);
	}
	public static boolean getPropertyBoolean(String key)
	{
		String value = getProperty(key);
		return value != null && value.equalsIgnoreCase("true");
	}
	
	public static String getConnectionConfigFilePath()
	{
		if (weaveContextParams == null)
			return null;
		return weaveContextParams.getConfigPath() + "/" + ConnectionConfig.XML_FILENAME;
	}
	
	synchronized public static ConnectionConfig getConnectionConfig() throws RemoteException
	{
		if (_connConfig == null)
			_connConfig = new ConnectionConfig(new File(getConnectionConfigFilePath()));
		return _connConfig;
	}
	
	synchronized public static DataConfig getDataConfig() throws RemoteException
	{
		ConnectionConfig cc = getConnectionConfig();
		if (_dataConfig == null)
			_dataConfig = new DataConfig(cc);
		return _dataConfig;
	}

	/**
	 * This function should be the first thing called by the Admin Console to initialize the servlet.
	 * If SQL config data migration is required, it will be done and periodic status updates will be written to the output stream.
	 * @param progress Used to output SQL config data migration status updates.
	 * @throws RemoteException Thrown when the DataConfig could not be initialized.
	 */
	synchronized public static void initializeAdminService(ProgressManager progress) throws RemoteException
	{
		ConnectionConfig cc = getConnectionConfig();
		if (cc.migrationPending())
		{
			_dataConfig = null; // set to null first in case next line fails
			_dataConfig = cc.initializeNewDataConfig(progress);
		}
	}
	
	public static String getDocrootPath()
	{
		if (weaveContextParams == null)
			return null;
		return weaveContextParams.getDocrootPath();
	}
	
	public static String getUploadPath()
	{
		if (weaveContextParams == null)
			return null;
		return weaveContextParams.getUploadPath();
	}
}
