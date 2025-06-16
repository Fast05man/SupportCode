import React, { useState, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const phoneRegex = /^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;
const cyrillicRegex = /^[А-Яа-яЁё\s]+$/;

const RegisterSchema = Yup.object().shape({
  login: Yup.string()
    .min(3, 'Логин должен быть не менее 3 символов')
    .required('Логин обязателен'),
  password: Yup.string()
    .min(4, 'Пароль должен быть не менее 4 символов')
    .required('Пароль обязателен'),
  full_name: Yup.string()
    .matches(cyrillicRegex, 'ФИО должно содержать только кириллицу')
    .required('ФИО обязательно'),
  email: Yup.string()
    .email('Некорректный email')
    .required('Email обязателен'),
  phone: Yup.string()
    .matches(phoneRegex, 'Телефон должен быть в формате +7(XXX)-XXX-XX-XX')
    .required('Телефон обязателен'),
});

const Register = () => {
  const { register } = useContext(AuthContext);
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await register(values);
    if (!result.success) {
      setError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-form">
      <h2>Регистрация</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Formik
        initialValues={{
          login: '',
          password: '',
          full_name: '',
          email: '',
          phone: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, handleChange, values, errors, touched, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Логин</Form.Label>
              <Form.Control
                type="text"
                name="login"
                value={values.login}
                onChange={handleChange}
                isInvalid={touched.login && !!errors.login}
              />
              <Form.Control.Feedback type="invalid">
                {errors.login}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Пароль</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                isInvalid={touched.password && !!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>ФИО</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={values.full_name}
                onChange={handleChange}
                isInvalid={touched.full_name && !!errors.full_name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.full_name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                isInvalid={touched.email && !!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Телефон</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                placeholder="+7(XXX)-XXX-XX-XX"
                value={values.phone}
                onChange={handleChange}
                isInvalid={touched.phone && !!errors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </Form>
        )}
      </Formik>
      <p className="mt-3">
        Уже есть аккаунт? <a href="/login">Войти</a>
      </p>
    </div>
  );
};

export default Register;