import React, {useState} from 'react';
import {motion} from 'motion/react';
import {Lock, Eye, EyeOff, Loader2} from 'lucide-react';
import {authService} from '../services/authService';
import {useToast} from '../contexts/ToastContext';

export function ChangePasswordCard() {
  const {showToast} = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      showToast('Uudet salasanat eivät täsmää.', 'error');
      return;
    }

    if (form.newPassword.length < 8) {
      showToast(
        'Uuden salasanan on oltava vähintään 8 merkkiä pitkä.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword(form.currentPassword, form.newPassword);
      showToast('Salasana vaihdettu onnistuneesti!', 'success');
      setForm({currentPassword: '', newPassword: '', confirmPassword: ''});
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Salasanan vaihto epäonnistui.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm transition-all hover:shadow-md">
      <h2 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
        <Lock size={20} className="text-primary" /> Turvallisuus
      </h2>
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Vaihda tilisi salasana. Käytä vähintään 8 merkkiä.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            Nykyinen salasana
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            required
            value={form.currentPassword}
            onChange={(e) =>
              setForm({...form, currentPassword: e.target.value})
            }
            className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Uusi salasana
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={form.newPassword}
              onChange={(e) => setForm({...form, newPassword: e.target.value})}
              className="w-full bg-input-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Vahvista uusi salasana
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({...form, confirmPassword: e.target.value})
              }
              className={`w-full bg-input-background border rounded-xl px-4 py-3 text-sm text-foreground focus:ring-2 outline-none transition-all ${
                form.confirmPassword &&
                form.newPassword !== form.confirmPassword
                  ? 'border-destructive focus:ring-destructive/50'
                  : 'border-border focus:ring-primary/50 focus:border-primary'
              }`}
            />
            {form.confirmPassword &&
              form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-destructive mt-1.5 font-medium">
                  Salasanat eivät täsmää
                </p>
              )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
          <button
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPasswords ? 'Piilota' : 'Näytä'}
          </button>

          <motion.button
            whileTap={{scale: 0.98}}
            disabled={
              isSubmitting ||
              !form.currentPassword ||
              !form.newPassword ||
              !form.confirmPassword
            }
            type="submit"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Päivitetään...' : 'Päivitä salasana'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
