<?php
/**
 * OpenEyes
 *
 * (C) Moorfields Eye Hospital NHS Foundation Trust, 2008-2011
 * (C) OpenEyes Foundation, 2011-2013
 * This file is part of OpenEyes.
 * OpenEyes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * OpenEyes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with OpenEyes in a file titled COPYING. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package OpenEyes
 * @link http://www.openeyes.org.uk
 * @author OpenEyes <info@openeyes.org.uk>
 * @copyright Copyright (c) 2008-2011, Moorfields Eye Hospital NHS Foundation Trust
 * @copyright Copyright (c) 2011-2013, OpenEyes Foundation
 * @license http://www.gnu.org/licenses/gpl-3.0.html The GNU General Public License V3.0
 */

class BaseModuleController extends BaseController {

	/* @var Firm - the firm that user is logged in as for current action action */
	public $firm;
	/* @var string alias path for the module of this controller */
	public $modulePathAlias;
	/* @var string alias path to asset files for the module */
	public $assetPathAlias;
	/* @var string path to asset files for the module */
	public $assetPath;
	/* @var EventType event type for this controller */
	private $_event_type;
	/* @var string css class for the module */
	public $moduleNameCssClass = '';


	/**
	 * The EventType class for this module
	 *
	 * @return EventType
	 */
	public function getEvent_type()
	{
		if (!$this->_event_type) {
			$this->_event_type = EventType::model()->find('class_name=?', array($this->getModule()->name));
		}
		return $this->_event_type;
	}

	/**
	 * Sets the firm property on the controller from the session
	 *
	 * @throws HttpException
	 */
	protected function setFirmFromSession()
	{
		if (!$firm_id = Yii::app()->session->get('selected_firm_id')) {
			throw new HttpException('Firm not selected');
		}
		if (!$this->firm || $this->firm->id != $firm_id) {
			$this->firm = Firm::model()->findByPk($firm_id);
		}
	}

	/**
	 * Sets up various standard js and css files for modules
	 *
	 * @param CAction $action
	 * @return bool
	 * (non-phpdoc)
	 * @see parent::beforeAction($action)
	 */
	protected function beforeAction($action)
	{
		if ($this->event_type && $this->event_type->disabled) {
			// disabled module
			$this->redirectToPatientEpisodes();
		}

		// Set the module CSS class name.
		$this->moduleNameCssClass = strtolower($this->module->id);

		$this->modulePathAlias = 'application.modules.'.$this->getModule()->name;
		$this->assetPathAlias = $this->modulePathAlias .'.assets';

		// Set asset path
		if (file_exists(Yii::getPathOfAlias($this->assetPathAlias))) {
			$this->assetPath = Yii::app()->assetManager->getPublishedPathOfAlias($this->assetPathAlias);
		}

		return parent::beforeAction($action);
	}

	/**
	 * Automatic include of various standard assets based on class and module name (including module inheritance)
	 */
	protected function registerAssets()
	{
		parent::registerAssets();

		// Only auto-register assets if the assetPath has been specified.
		if (!$this->assetPath) {
			return;
		}

		$module = $this->getModule();
		$paths = array();
		foreach (array_reverse($module->getModuleInheritanceList()) as $inherited) {
			$paths[] = $inherited->name;
		}
		$paths[] = $module->name;

		foreach ($paths as $p) {
			$package = $this->createModulePackage($p);
			Yii::app()->clientScript
				->addPackage($p, $package)
				->registerPackage($p);
		}
	}

	/**
	 * Creates a client-side package for this module.
	 * @param  string $moduleName Name of the module.
	 * @return array The package definition.
	 */
	protected function createModulePackage($moduleName=null)
	{
		$package  = array(
			'js' => array(),
			'css' => array('css/module.css'),
			'basePath' => 'application.modules.'.$moduleName.'.assets',
			'depends' => array('events_and_episodes')
		);

		if ($this->isPrintAction($this->action->id)) {
			$package['css'][] = 'css/print.css';
		} else {
			$package['js'][] = 'js/module.js';
			// Register controller specific js (note for this to work, controllers in child modules must be named the same
			// as the corresponding controller in the parent module(s)
			$package['js'][] = 'js/'.Helper::getNSShortname($this).'.js';
		}

		return Yii::app()->clientScript->createPackage($moduleName, $package);
	}

	/**
	 * Redirect to the patient episodes when the controller determines the action cannot be carried out
	 */
	protected function redirectToPatientEpisodes()
	{
		$this->redirect(array("/patient/episodes/".$this->patient->id));
	}

}