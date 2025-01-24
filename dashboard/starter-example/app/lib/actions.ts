'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) {
  try {
    // Parse form data with CreateInvoice schema
    const { customerId, amount, status } = CreateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    // Debugging: Log parsed data
    console.log('Parsed createInvoice data:', { customerId, amount, status });

    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];

    // Debugging: Log the SQL query parameters
    console.log('Preparing to insert invoice:', {
      customerId,
      amountInCents,
      status,
      date,
    });

    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;

    // Debugging: Log successful insertion
    console.log('Invoice successfully created.');

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  } catch (error) {
    // Debugging: Log error
    console.error('Error in createInvoice:', error);
    throw error; // Re-throw to maintain original behavior
  }
}

export async function deleteInvoice(id: string) {
  try {
    // Debugging: Log ID of the invoice to be deleted
    console.log('Preparing to delete invoice with ID:', id);

    await sql`DELETE FROM invoices WHERE id = ${id}`;

    // Debugging: Log successful deletion
    console.log('Invoice successfully deleted.');

    revalidatePath('/dashboard/invoices');
  } catch (error) {
    // Debugging: Log error
    console.error('Error in deleteInvoice:', error);
    throw error; // Re-throw to maintain original behavior
  }
}

export async function updateInvoice(id: string, formData: FormData) {
  try {
    // Parse form data with UpdateInvoice schema
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });

    // Debugging: Log parsed data
    console.log('Parsed updateInvoice data:', { id, customerId, amount, status });

    const amountInCents = amount * 100;

    // Debugging: Log the SQL query parameters
    console.log('Preparing to update invoice:', {
      id,
      customerId,
      amountInCents,
      status,
    });

    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;

    // Debugging: Log successful update
    console.log('Invoice successfully updated.');

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  } catch (error) {
    // Debugging: Log error
    console.error('Error in updateInvoice:', error);
    throw error; // Re-throw to maintain original behavior
  }
}
