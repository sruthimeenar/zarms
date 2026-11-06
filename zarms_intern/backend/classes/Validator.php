<?php

class Validator {

    private $errors = [];

    public static function validate($data, $rules) {
        $instance = new self();
        $isValid = $instance->validateInstance($data, $rules);

        return [
            'valid' => $isValid,
            'errors' => $instance->getErrors()
        ];
    }

    private function validateInstance($data, $rules) {
        $this->errors = [];

        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $rulesArray = explode('|', $fieldRules);

            foreach ($rulesArray as $rule) {
                $this->applyRule($field, $value, $rule, $data);
            }
        }

        return empty($this->errors);
    }

    private function applyRule($field, $value, $rule, $allData) {
        $parts = explode(':', $rule);
        $ruleName = $parts[0];
        $ruleValue = $parts[1] ?? null;

        switch ($ruleName) {
            case 'required':
                if (empty($value) && $value !== '0') {
                    $this->addError($field, ucfirst($field) . ' is required');
                }
                break;

            case 'email':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, ucfirst($field) . ' must be a valid email address');
                }
                break;

            case 'min':
                if (!empty($value) && strlen($value) < (int)$ruleValue) {
                    $this->addError($field, ucfirst($field) . " must be at least {$ruleValue} characters");
                }
                break;

            case 'max':
                if (!empty($value) && strlen($value) > (int)$ruleValue) {
                    $this->addError($field, ucfirst($field) . " must not exceed {$ruleValue} characters");
                }
                break;

            case 'minval':
                if (!empty($value) && (int)$value < (int)$ruleValue) {
                    $this->addError($field, ucfirst($field) . " must be at least {$ruleValue}");
                }
                break;

            case 'maxval':
                if (!empty($value) && (int)$value > (int)$ruleValue) {
                    $this->addError($field, ucfirst($field) . " must not exceed {$ruleValue}");
                }
                break;

            case 'numeric':
                if (!empty($value) && !is_numeric($value)) {
                    $this->addError($field, ucfirst($field) . ' must be a number');
                }
                break;

            case 'alpha':
                if (!empty($value) && !ctype_alpha(str_replace(' ', '', $value))) {
                    $this->addError($field, ucfirst($field) . ' must contain only letters');
                }
                break;

            case 'alphanumeric':
                if (!empty($value) && !ctype_alnum(str_replace(' ', '', $value))) {
                    $this->addError($field, ucfirst($field) . ' must contain only letters and numbers');
                }
                break;

            case 'phone':
                $cleaned = preg_replace('/[^0-9]/', '', $value);
                if (!empty($value) && (strlen($cleaned) < 10 || strlen($cleaned) > 15)) {
                    $this->addError($field, ucfirst($field) . ' must be a valid phone number (10-15 digits)');
                }
                break;

            case 'url':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_URL)) {
                    $this->addError($field, ucfirst($field) . ' must be a valid URL');
                }
                break;

            case 'in':
                $allowed = explode(',', $ruleValue);
                if (!empty($value) && !in_array($value, $allowed)) {
                    $this->addError($field, ucfirst($field) . ' must be one of: ' . implode(', ', $allowed));
                }
                break;

            case 'same':
                if (!empty($value) && $value !== ($allData[$ruleValue] ?? null)) {
                    $this->addError($field, ucfirst($field) . " must match {$ruleValue}");
                }
                break;

            case 'unique':
                // Format: unique:table,column
                list($table, $column) = explode(',', $ruleValue);
                if (!empty($value) && $this->isNotUnique($table, $column, $value)) {
                    $this->addError($field, ucfirst($field) . ' already exists');
                }
                break;

            case 'password':
                if (!empty($value) && !$this->validatePassword($value)) {
                    $this->addError($field, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
                }
                break;

            case 'boolean':
                if (!empty($value) && !in_array($value, [true, false, 0, 1, '0', '1', 'true', 'false'], true)) {
                    $this->addError($field, ucfirst($field) . ' must be true or false');
                }
                break;

            case 'array':
                if (!empty($value) && !is_array($value)) {
                    $this->addError($field, ucfirst($field) . ' must be an array');
                }
                break;

            case 'regex':
                if (!empty($value) && !preg_match($ruleValue, $value)) {
                    $this->addError($field, ucfirst($field) . ' format is invalid');
                }
                break;
        }
    }

    private function validatePassword($password) {
        // At least 8 characters
        if (strlen($password) < 8) return false;

        // At least one uppercase letter
        if (!preg_match('/[A-Z]/', $password)) return false;

        // At least one lowercase letter
        if (!preg_match('/[a-z]/', $password)) return false;

        // At least one number
        if (!preg_match('/[0-9]/', $password)) return false;

        // At least one special character
        if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]/', $password)) return false;

        return true;
    }

    private function isNotUnique($table, $column, $value) {
        try {
            $db = Database::getInstance();
            $sql = "SELECT COUNT(*) as count FROM {$table} WHERE {$column} = ?";
            $result = $db->fetchOne($sql, [$value]);
            return $result['count'] > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    private function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }

    public function getErrors() {
        return $this->errors;
    }

    public function hasErrors() {
        return !empty($this->errors);
    }

    public static function sanitize($data) {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }

    public static function sanitizeEmail($email) {
        return filter_var(trim(strtolower($email)), FILTER_SANITIZE_EMAIL);
    }

    public static function sanitizePhone($phone) {
        return preg_replace('/[^0-9+]/', '', $phone);
    }
}
