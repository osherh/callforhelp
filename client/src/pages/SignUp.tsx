import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, collections } from '../firebase/connection';
import { useNavigate } from 'react-router-dom';
import Form, { FormOptions } from '../components/Form';
import Header from '../components/Header';
import { deleteDoc, doc, setDoc } from '@firebase/firestore';
import React from 'react';
import { createUserWithEmailAndPassword, deleteUser, updateProfile } from '@firebase/auth';
import ErrorModal, { ErrorInfo } from '../components/ErrorModal';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [stage, setStage] = useState<'start' | 'updating' | 'end'>('start');
  const [error, setError] = useState<ErrorInfo>();

  const handleFormSubmit = async ({ name, email, password }: FormOptions) => {
    setStage('updating');
    try {
      const user = await createUserWithEmailAndPassword(auth, email!, password!);

      if (user) {
        try {
          await setDoc(doc(collections.users, user.user.uid), { name: name!, acceptedTerms: true });
        } catch (e) {
          await deleteUser(user.user);
          throw { code: 'error' };
        }
        try {
          await updateProfile(user.user, { displayName: name });
        } catch (e) {
          await deleteDoc(doc(collections.users, user.user.uid));
          await deleteUser(user.user);
          throw { code: 'error' };
        }
        setStage('end');
      }
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setError({
          title: 'המשתמש כבר קיים',
          content: 'אי אפשר ליצור יותר ממשתמש אחד עם אותו אימייל'
        });
      } else {
        setError({
          title: 'שגיאה',
          content: 'אירעה שגיאה בעת התחברות בעזרת אימייל'
        });
      }
    }
  };

  useEffect(() => {
    // Only redirect if the user existed before creating the user and after creating the user and assigning him the username
    if (user && stage !== 'updating') {
      navigate('/selection');
    }
  }, [user, navigate, stage]);

  return (
    <>
      {error && <ErrorModal {...error} onClose={() => setError(undefined)} />}
      <Header>הרשמה עם אימייל</Header>
      <Form name password email onSubmit={handleFormSubmit} submitLabel="להרשמה" />
    </>
  );
};

export default SignUpPage;
