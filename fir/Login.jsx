import React, { useState, useContext } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Formik } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  login: Yup.string().required('Логин обязателен'),
  password: Yup.string().required('Пароль обязателен'),
});

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (values, { setSubmitting }) => {
    const result = await login(values);
    if (!result.success) {
      setError(result.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="auth-form">
      <h2>Вход</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Formik
        initialValues={{ login: '', password: '' }}
        validationSchema={LoginSchema}
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

            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Вход...' : 'Войти'}
            </Button>
          </Form>
        )}
      </Formik>
      <p className="mt-3">
        Ещё нет аккаунта? <a href="/register">Зарегистрироваться</a>
      </p>
    </div>
  );
};

export default Login;