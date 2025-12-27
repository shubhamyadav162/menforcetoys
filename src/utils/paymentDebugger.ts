// Payment Flow Debugger Utility
export class PaymentDebugger {
  private static logPrefix = '🔍 [Payment Debugger]';

  static logPaymentFlow(step: string, data?: any) {
    console.log(`${this.logPrefix} ${step}`, data || '');
  }

  static logError(step: string, error: any) {
    console.error(`${this.logPrefix} ERROR at ${step}:`, error);
  }

  static logEdgeFunctionCall(functionName: string, payload: any, response: any) {
    console.log(`${this.logPrefix} Edge Function Call:`);
    console.log(`  Function: ${functionName}`);
    console.log(`  Payload:`, payload);
    console.log(`  Response:`, response);
  }

  static logNavigationFlow(from: string, to: string, state?: any) {
    console.log(`${this.logPrefix} Navigation:`);
    console.log(`  From: ${from}`);
    console.log(`  To: ${to}`);
    if (state) console.log(`  State:`, state);
  }

  static async testSupabaseConnection() {
    this.logPaymentFlow('Testing Supabase connection...');
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.from('orders').select('count').single();

      if (error) {
        this.logError('Supabase connection test', error);
        return false;
      }

      this.logPaymentFlow('Supabase connection successful', data);
      return true;
    } catch (err) {
      this.logError('Supabase connection test', err);
      return false;
    }
  }

  static async testEdgeFunction(functionName: string) {
    this.logPaymentFlow(`Testing edge function: ${functionName}`);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.functions.invoke(functionName, {
        headers: { 'Accept': 'application/json' }
      });

      this.logEdgeFunctionCall(functionName, {}, { data, error });
      return { data, error };
    } catch (err) {
      this.logError(`Edge function test: ${functionName}`, err);
      return { data: null, error: err };
    }
  }

  static logFormSubmission(formData: any, validation: any) {
    console.log(`${this.logPrefix} Form Submission:`);
    console.log(`  Form Data:`, formData);
    console.log(`  Validation:`, validation);
  }

  static logPaymentCreation(orderData: any) {
    console.log(`${this.logPrefix} Payment Creation:`);
    console.log(`  Order Data:`, orderData);
  }
}

// Auto-enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Payment Debugger Enabled - Add this to your browser console for debugging:');
  console.log('window.PaymentDebugger = window.PaymentDebugger || require("@/utils/paymentDebugger").PaymentDebugger;');
}

export default PaymentDebugger;