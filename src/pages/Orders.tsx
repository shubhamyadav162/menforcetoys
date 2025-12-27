import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { supabase, type Order } from "@/lib/supabase";
import { format } from "date-fns";
import { Trash2, RefreshCw, Check, X, Truck, Package } from "lucide-react";

const Orders = () => {
  const { language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const content = {
    en: {
      title: "Orders Management",
      loading: "Loading orders...",
      error: "Error loading orders",
      empty: "No orders found",
      refresh: "Refresh Orders",
      orderId: "Order ID",
      customer: "Customer",
      product: "Product",
      quantity: "Quantity",
      total: "Total",
      status: "Status",
      payment: "Payment",
      phone: "Phone",
      address: "Address",
      orderDate: "Order Date",
      actions: "Actions",
      confirm: "Confirm",
      cancel: "Cancel",
      ship: "Ship",
      deliver: "Mark Delivered",
      delete: "Delete",
      viewDetails: "View Details"
    },
    hi: {
      title: "ऑर्डर प्रबंधन",
      loading: "ऑर्डर लोड हो रहे हैं...",
      error: "ऑर्डर लोड करने में त्रुटि",
      empty: "कोई ऑर्डर नहीं मिला",
      refresh: "ऑर्डर रिफ्रेश करें",
      orderId: "ऑर्डर आईडी",
      customer: "ग्राहक",
      product: "उत्पाद",
      quantity: "मात्रा",
      total: "कुल",
      status: "स्थिति",
      payment: "भुगतान",
      phone: "फोन",
      address: "पता",
      orderDate: "ऑर्डर दिनांक",
      actions: "कार्य",
      confirm: "पुष्टि करें",
      cancel: "रद्द करें",
      ship: "भेजें",
      deliver: "डिलीवर किया गया",
      delete: "हटाएं",
      viewDetails: "विवरण देखें"
    }
  };

  const t = content[language];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(language === "en" ? "Failed to load orders" : "ऑर्डर लोड करने में विफल");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Refresh orders
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert(language === "en" ? "Failed to update order status" : "ऑर्डर स्थिति अपडेट करने में विफल");
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (window.confirm(language === "en" ? "Are you sure you want to delete this order?" : "क्या आप वाकई इस ऑर्डर को हटाना चाहते हैं?")) {
      try {
        const { error } = await supabase
          .from('orders')
          .delete()
          .eq('id', orderId);

        if (error) throw error;

        // Refresh orders
        fetchOrders();
      } catch (err) {
        console.error('Error deleting order:', err);
        alert(language === "en" ? "Failed to delete order" : "ऑर्डर हटाने में विफल");
      }
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case 'pending':
        return (
          <>
            <Button size="sm" onClick={() => updateOrderStatus(order.id, 'confirmed')} className="text-xs">
              <Check className="w-3 h-3 mr-1" />
              {t.confirm}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, 'cancelled')} className="text-xs">
              <X className="w-3 h-3 mr-1" />
              {t.cancel}
            </Button>
          </>
        );
      case 'confirmed':
        return (
          <Button size="sm" onClick={() => updateOrderStatus(order.id, 'shipped')} className="text-xs">
            <Package className="w-3 h-3 mr-1" />
            {t.ship}
          </Button>
        );
      case 'shipped':
        return (
          <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')} className="text-xs">
            <Truck className="w-3 h-3 mr-1" />
            {t.deliver}
          </Button>
        );
      case 'delivered':
      case 'cancelled':
        return null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">{t.loading}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-4">{t.error}</p>
            <Button onClick={fetchOrders}>
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.refresh}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-secondary/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">{t.title}</h1>
            <Button onClick={fetchOrders} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t.refresh}
            </Button>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground text-lg">{t.empty}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Order Details */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.orderId}</span>
                          <span className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.customer}</span>
                          <span className="font-medium">{order.full_name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.product}</span>
                          <span className="font-medium">{order.product_name[language]}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.quantity}</span>
                          <span>{order.quantity}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.total}</span>
                          <span className="font-bold text-primary">₹{order.total_amount}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.orderDate}</span>
                          <span className="text-sm">{formatDate(order.created_at)}</span>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.status}</span>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{t.payment}</span>
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {order.payment_status}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">{t.phone}:</span>
                            <p className="font-medium">{order.phone}</p>
                          </div>

                          <div>
                            <span className="text-sm text-muted-foreground">{t.address}:</span>
                            <p className="text-sm">
                              {order.address}, {order.city}, {order.state} - {order.pincode}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <span className="text-sm text-muted-foreground">{t.actions}:</span>
                          <div className="flex gap-2 flex-wrap">
                            {getStatusActions(order)}
                            <Button size="sm" variant="destructive" onClick={() => deleteOrder(order.id)} className="text-xs">
                              <Trash2 className="w-3 h-3 mr-1" />
                              {t.delete}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Orders;