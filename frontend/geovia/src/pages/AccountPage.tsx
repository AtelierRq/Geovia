import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "../styles/profile.css";

function AccountPage() {
  const { user, updateUser, signOut } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  function saveEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateUser({ email: email.trim() });
    setSaved(true);
  }

  function logout() {
    signOut();
    navigate("/");
  }

  return (
    <main className="profile-page account-page">
      <div className="account-back-row">
        <Link to="/profile">
          <ArrowLeft size={17} /> Wróć do profilu
        </Link>
      </div>

      <section className="profile-heading">
        <div>
          <span className="eyebrow">KONTO I BEZPIECZEŃSTWO</span>
          <h1>Ustawienia konta</h1>
          <p>Zarządzaj adresem e-mail, hasłem i bezpieczeństwem konta.</p>
        </div>
      </section>

      <div className="account-settings-layout">
        <section className="account-card account-settings-card">
          <div className="settings-section-title">
            <div className="settings-icon"><Mail size={20} /></div>
            <div>
              <h2>Adres e-mail</h2>
              <p>Adres używany do logowania i kontaktu z Geovią.</p>
            </div>
          </div>
          <form className="account-form" onSubmit={saveEmail}>
            <label>
              Adres e-mail
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setSaved(false);
                }}
                required
              />
            </label>
            <div className="account-info-note">
              <strong>Weryfikacja adresu e-mail</strong>
              <p>Wysyłanie wiadomości potwierdzającej będzie dostępne po podłączeniu backendu.</p>
            </div>
            <div className="account-form-actions">
              <button className="primary-button" type="submit">
                Zapisz adres e-mail
              </button>
              {saved && <span className="account-saved-message">Zmiany zapisane lokalnie.</span>}
            </div>
          </form>
        </section>

        <section className="account-card account-settings-card">
          <div className="settings-section-title">
            <div className="settings-icon"><KeyRound size={20} /></div>
            <div>
              <h2>Hasło</h2>
              <p>Chroń dostęp do swojego konta.</p>
            </div>
          </div>
          <p className="settings-description">Zmiana hasła będzie dostępna po wdrożeniu prawdziwego systemu logowania.</p>
          <button type="button" className="secondary-button" disabled>
            Zmień hasło
          </button>
          <span className="coming-soon-label">W przygotowaniu</span>
        </section>

        <section className="account-card account-settings-card">
          <div className="settings-section-title">
            <div className="settings-icon"><ShieldCheck size={20} /></div>
            <div>
              <h2>Bezpieczeństwo</h2>
              <p>Dodatkowe opcje ochrony konta.</p>
            </div>
          </div>
          <div className="settings-option-row">
            <div>
              <strong>Potwierdzenie adresu e-mail</strong>
              <p>Potwierdzanie adresu zostanie dodane wraz z backendem.</p>
            </div>
            <span className="coming-soon-label">W przygotowaniu</span>
          </div>
          <div className="settings-option-row">
            <div>
              <strong>Aktywne sesje</strong>
              <p>W przyszłości będzie można sprawdzać i kończyć inne sesje.</p>
            </div>
            <span className="coming-soon-label">W przygotowaniu</span>
          </div>
        </section>

        <section className="account-card account-settings-card account-danger-card">
          <div className="settings-section-title">
            <div className="settings-icon danger-icon"><Trash2 size={20} /></div>
            <div>
              <h2>Usuwanie konta</h2>
              <p>Trwałe usunięcie konta i powiązanych z nim danych.</p>
            </div>
          </div>
          <p className="settings-description">Ta opcja nie jest dostępna w trybie demonstracyjnym.</p>
          <button type="button" className="danger-outline-button" disabled>
            <Trash2 size={16} /> Usuń konto
          </button>
        </section>
      </div>

      <section className="account-logout-section">
        <div>
          <h2>Wylogowanie</h2>
          <p>Wyloguj się z bieżącego konta demonstracyjnego na tej przeglądarce.</p>
        </div>
        <button className="account-logout-button" type="button" onClick={logout}>
          <LogOut size={17} /> Wyloguj
        </button>
      </section>
      <p className="account-demo-footnote">
        <CheckCircle2 size={15} /> Geovia korzysta obecnie z demonstracyjnego konta. Opcje wymagające serwera są oznaczone jako „W przygotowaniu”.
      </p>
    </main>
  );
}

export default AccountPage;
