<?php
/**
 * OpenEyes
 *
 * (C) Moorfields Eye Hospital NHS Foundation Trust, 2008-2011
 * (C) OpenEyes Foundation, 2011-2014
 * This file is part of OpenEyes.
 * OpenEyes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * OpenEyes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with OpenEyes in a file titled COPYING. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package OpenEyes
 * @link http://www.openeyes.org.uk
 * @author OpenEyes <info@openeyes.org.uk>
 * @copyright Copyright (c) 2008-2011, Moorfields Eye Hospital NHS Foundation Trust
 * @copyright Copyright (c) 2011-2014, OpenEyes Foundation
 * @license http://www.gnu.org/licenses/gpl-3.0.html The GNU General Public License V3.0
 */

class PatientPanel extends BaseCWidget
{

	public $patient;
	public $age;

	public function init()
	{
		$this->age = $this->patient->isDeceased() ? 'Deceased' : $this->patient->getAge();
		parent::init();
	}

	protected function getWidgets() {

		$widgets = Yii::app()->params['patient_summary_id_widgets'];

		uasort($widgets, function($a, $b) {
			$orderA = @$a['order'] ?: 0;
			$orderB = @$b['order'] ?: 0;
			return $orderA - $orderB;
		});

		$rendered = array();

		foreach ($widgets as $w) {

			$output = $this->widget($w['class'], array(
				'patient' => $this->patient,
			), true);

			if ($output) {
				$rendered[] = $output;
			}
		}

		return $rendered;
	}
}