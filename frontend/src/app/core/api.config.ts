// URL base da API num só sítio: se a porta mudar, muda-se aqui e não em cada serviço.
// Usamos https porque o Program.cs tem UseHttpsRedirection; um pedido http seria redirecionado
// e os redirecionamentos costumam fazer falhar os pedidos CORS do browser.
export const API_BASE_URL = 'https://localhost:7215/api';
