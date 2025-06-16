import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import api from '../../services/api';

const AdminPanel = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin');
        setUsers(response.data.users);
        setOrders(response.data.orders);
      } catch (err) {
        setError('Не удалось загрузить данные');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/order/${orderId}`, { status: newStatus });
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (err) {
      setError('Не удалось изменить статус заказа');
    }
  };

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
      <h2>Панель администратора</h2>
      
      <h3 className="mt-4">Пользователи</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Логин</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>ФИО</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.login}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.full_name}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h3 className="mt-4">Заказы</h3>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Пользователь</th>
            <th>Товар</th>
            <th>Количество</th>
            <th>Адрес</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => {
            const user = users.find(u => u.id === order.user_id);
            return (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{user ? `${user.full_name} (${user.email})` : 'Неизвестный пользователь'}</td>
                <td>{order.product_name}</td>
                <td>{order.quantity}</td>
                <td>{order.delivery_address}</td>
                <td>
                  <Badge bg={getStatusVariant(order.status)}>
                    {order.status === 'Pending' && 'Новый'}
                    {order.status === 'Confirmed' && 'Подтвержден'}
                    {order.status === 'Cancelled' && 'Отменен'}
                  </Badge>
                </td>
                <td>
                  {order.status === 'Pending' && (
                    <>
                      <Button 
                        variant="success" 
                        size="sm" 
                        onClick={() => handleStatusChange(order.id, 'Confirmed')}
                        className="me-2"
                      >
                        Подтвердить
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleStatusChange(order.id, 'Cancelled')}
                      >
                        Отменить
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminPanel;