<?php
/**
 * (C) OpenEyes Foundation, 2014
 * This file is part of OpenEyes.
 * OpenEyes is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 * OpenEyes is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with OpenEyes in a file titled COPYING. If not, see <http://www.gnu.org/licenses/>.
 *
 * @package OpenEyes
 * @link http://www.openeyes.org.uk
 * @author OpenEyes <info@openeyes.org.uk>
 * @copyright Copyright (C) 2014, OpenEyes Foundation
 * @license http://www.gnu.org/licenses/gpl-3.0.html The GNU General Public License V3.0
 */

namespace services;

abstract class DeclarativeTypeParser
{
	abstract public function modelToResourceParse($object, $attribute, $data_class, $param=null);
	abstract public function resourceToModelParse(&$model, $resource, $model_attribute, $res_attribute, $model_class, $param1, $save);
	abstract public function jsonToResourceParse($object, $attribute, $data_class, $model_class);

	public function __construct(&$mc)
	{
		$this->mc = $mc;
	}

	static public function expandObjectAttribute(&$object, $attributes)
	{
		if (!is_array($attributes)) {
			$attributes = explode('.',$attributes);
		}

		$attribute = array_shift($attributes);

		if (count($attributes) >0) {
			if (!$object->$attribute) {
				return null;
			}

			return self::expandObjectAttribute($object->$attribute, $attributes);
		}

		return $object->$attribute;
	}

	static public function setObjectAttribute(&$object, $attributes, $value, $force=true)
	{
		if (!is_array($attributes)) {
			$attributes = explode('.',$attributes);
		}

		$attribute = array_shift($attributes);

		if (count($attributes) >0) {
			if (!$object->$attribute) {
				return false;
			}

			return self::setObjectAttribute($object->$attribute, $attributes, $value, $force);
		}

		if ($force || !$object->$attribute) {
			$object->$attribute = $value;
		}
	}

	static public function setObjectAttributes(&$object, $attributes)
	{
		foreach ($attributes as $key => $value) {
			if (method_exists($object,'setAttribute')) {
				$object->setAttribute($key,$value);
			} else {
				$object->$key = $value;
			}
		}
	}

	static public function attributesAllNull($object, $attributes)
	{
		foreach ($attributes as $attribute) {
			if ($object->$attribute !== null) {
				return false;
			}
		}

		return true;
	}
}
