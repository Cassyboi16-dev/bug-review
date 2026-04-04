"use client";
import { Formik, Form, Field, ErrorMessage } from 'formik';

export default function UploadClient() {
  return (
    <main className='min-h-dvh bg-slate-950 text-xl text-emerald-400'>
    <Formik>
      <Form>
        <label htmlFor='title'>Title</label>
        <Field />
      </Form>
    </Formik>
    </main>
  );
}