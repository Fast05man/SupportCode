import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Авоська</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user && (
              <>
                <Nav.Link as={Link} to="/orders">Мои заказы</Nav.Link>
                {user.login === 'admin' || user.login === 'sklad' ? (
                  <Nav.Link as={Link} to="/admin">Админ-панель</Nav.Link>
                ) : null}
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  Вы вошли как: <strong>{user.login}</strong>
                </Navbar.Text>
                <Button variant="outline-secondary" onClick={handleLogout}>
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Вход</Nav.Link>
                <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;