import React, { useState, useEffect, useContext } from 'react';
import { Button, Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        setOrders(response.data.orders);
      } catch (err) {
        setError('Не удалось загрузить заказы');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Confirmed': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Мои заказы</h2>
        <Button variant="primary" onClick={() => navigate('/orders/new')}>
          Новый заказ
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <Card.Body>
            <Card.Text>У вас пока нет заказов</Card.Text>
            <Button variant="primary" onClick={() => navigate('/orders/new')}>
              Создать первый заказ
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <ListGroup>
          {orders.map((order) => (
            <ListGroup.Item key={order.id}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>{order.product_name}</h5>
                  <div>Количество: {order.quantity}</div>
                  <div>Адрес: {order.delivery_address}</div>
                </div>
                <Badge bg={getStatusVariant(order.status)}>
                  {order.status === 'Pending' && 'Новый'}
                  {order.status === 'Confirmed' && 'Подтвержден'}
                  {order.status === 'Cancelled' && 'Отменен'}
                </Badge>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default OrderList;