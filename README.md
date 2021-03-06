Weave: Web-based Analysis and Visualization Environment - http://www.oicweave.org/

Issue Tracker & Wiki: http://info.oicweave.org/

Developer documentation: http://ivpr.github.com/Weave-Binaries/asdoc/

Nightly build: https://github.com/IVPR/Weave-Binaries/zipball/master

Components in this repository:

 * WeaveAPI: MPL 2.0, ActionScript interface classes
 * WeaveCore: GPLv3 license, core sessioning framework
 * WeaveData: GPLv3 license, columns related to loading data and other non-UI features.
 * WeaveUI: GPLv3 license, user interface classes
 * WeaveClient: GPLv3 license, Flex client application for visualization environment
 * WeaveAdmin: GPLv3 license, Flex application for admin activities
 * WeaveServices: GPLv3 license, back-end Java webapp for Admin and Data server features
 * GeometryStreamConverter: GPLv3 license, Java library for converting geometries into a streaming format
 * JTDS_SqlServerDriver: LGPL license, Java library for handling connections to Microsoft SQL Server.
 
The bare minimum you need to build Weave is [Flex 4.5.1.A](http://fpdownload.adobe.com/pub/flex/sdk/builds/flex4.5/flex_sdk_4.5.1.21328A.zip) and [Java EE](http://www.oracle.com/technetwork/java/javaee/downloads/index.html).  However, we recommend the following setup: http://info.oicweave.org/projects/weave/wiki/Development_environment_setup

To build the projects on the command line, use the **build.xml** Ant script. To create a ZIP file for deployment on another system (much like the nightlies,) use the **dist** target.

See install-linux.md for detailed linux install instructions.
