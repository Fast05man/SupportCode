import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Formik } from 'formik';
import * as Yup from 'yup';

const OrderSchema = Yup.object().shape({
  product_name: Yup.string().required('Название товара обязательно'),
  quantity: Yup.number()
    .min(1, 'Минимальное количество - 1')
    .required('Количество обязательно'),
  delivery_address: Yup.string().required('Адрес доставки обязателен'),
});

const OrderForm = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // В реальном приложении здесь был бы запрос к API для получения списка товаров
    const fetchProducts = async () => {
      try {
        // Заглушка - в реальном приложении нужно получать товары с сервера
        setProducts([
          { id: 1, name: 'Яблоки', description: 'Свежие яблоки, 1 кг' },
          { id: 2, name: 'Молоко', description: 'Молоко 2,5%, 1 л' },
          { id: 3, name: 'Хлеб', description: 'Белый хлеб, 500 г' },
        ]);
      } catch (err) {
        setError('Не удалось загрузить список товаров');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await api.post('/order', values);
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка при создании заказа');
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2>Новый заказ</h2>
      <Formik
        initialValues={{
          product_name: '',
          quantity: 1,
          delivery_address: '',
        }}
        validationSchema={OrderSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, handleChange, values, errors, touched, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Товар</Form.Label>
              <Form.Select
                name="product_name"
                value={values.product_name}
                onChange={handleChange}
                isInvalid={touched.product_name && !!errors.product_name}
              >
                <option value="">Выберите товар</option>
                {products.map((product) => (
                  <option key={product.id} value={product.name}>
                    {product.name} - {product.description}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.product_name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Количество</Form.Label>
              <Form.Control
                type="number"
                min="1"
                name="quantity"
                value={values.quantity}
                onChange={handleChange}
                isInvalid={touched.quantity && !!errors.quantity}
              />
              <Form.Control.Feedback type="invalid">
                {errors.quantity}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Адрес доставки</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="delivery_address"
                value={values.delivery_address}
                onChange={handleChange}
                isInvalid={touched.delivery_address && !!errors.delivery_address}
              />
              <Form.Control.Feedback type="invalid">
                {errors.delivery_address}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать заказ'}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default OrderForm;