import { useState } from 'react';
import Button from '../common/Button';

const initialForm = {
  name: '',
  email: '',
  password: '',
  golfClub: '',
};

export default function SignupForm() {
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    console.log('Signup payload', form);
  }

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      {Object.entries(form).map(([key, value]) => (
        <div className="field" key={key}>
          <label htmlFor={key}>{key}</label>
          <input
            id={key}
            name={key}
            type={key === 'password' ? 'password' : 'text'}
            value={value}
            onChange={handleChange}
            required
          />
        </div>
      ))}
      <Button type="submit">Create Account</Button>
    </form>
  );
}
