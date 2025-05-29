const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});
app.use(express.json(), cors());

class OrderController {
    constructor() {
        this.pending_orders = [];
        this.completed_orders = [];
        this.bots = [];
        this.order_counter = 1;
        this.processing_orders = [];
    }

    updateClients() {
        io.emit('orders_update', {
            pending_orders: this.pending_orders,
            completed_orders: this.completed_orders,
            processing_orders: this.processing_orders
        });
    }

    addOrder(type, name) {
        let order = { id: this.order_counter++, type, name };
        if (type.toUpperCase() === "VIP") {
            // VIP orders are placed first
            this.pending_orders.unshift(order);
        } else {
            this.pending_orders.push(order);
        }
        this.processOrders();
    }

    addBot() {
        // Generate Bot ID
        let id = this.bots.length > 0 ? this.bots[this.bots.length - 1].id + 1 : 1;
        let bot = { id: id, busy: false };
        this.bots.push(bot);
        this.processOrders();
    }

    deleteBot(id) {
        let bot_index = this.bots.findIndex(bot => bot.id == id);
        // Remove bot
        if (bot_index !== -1) {
            this.bots.splice(bot_index, 1);

            // Find and remove processing orders by bot
            let processing_index = this.processing_orders.findIndex(o => o.bot.id == id);
            if (processing_index !== -1) {
                console.log(`Bot ${id} stopped processing order ${this.processing_orders[processing_index].order.id}`);

                // Requeue the order
                this.pending_orders.unshift(this.processing_orders[processing_index].order);
                this.processing_orders.splice(processing_index, 1);
            }

            console.log(`Bot ${id} removed.`);

            // Restart processing with available bots
            this.processOrders();
        } else {
            console.log(`Bot ${id} not found.`);
        }
    }

    processOrders() {
        this.bots.forEach(bot => {
            if (!bot.busy) {
                let vip_order = this.pending_orders.find(order => order.type === "VIP");
                if (vip_order) {
                    this.pending_orders = this.pending_orders.filter(order => order.id !== vip_order.id);
                    this.startProcessing(bot, vip_order);
                } else if (this.pending_orders.length > 0) {
                    let normalOrder = this.pending_orders.shift();
                    this.startProcessing(bot, normalOrder);
                }
            } else {
                let vip_order = this.pending_orders.find(order => order.type === "VIP");
                if (vip_order && !this.processing_orders.some(o => o.order.type === "VIP")) {
                    console.log(`Bot ${bot.id} is switching to process VIP order ${vip_order.id}`);

                    // Requeue interrupted order
                    let interrupted_order_index = this.processing_orders.findIndex(order => order.bot.id === bot.id);
                    if (interrupted_order_index !== -1) {
                        this.pending_orders.unshift(this.processing_orders[interrupted_order_index].order);
                        this.processing_orders.splice(interrupted_order_index, 1);
                    }

                    this.pending_orders = this.pending_orders.filter(order => order.id !== vip_order.id);
                    this.startProcessing(bot, vip_order);
                }
            }
        });
    }

    startProcessing(bot, order) {
        bot.busy = true;
        this.processing_orders.push({ bot, order });

        this.updateClients();
        console.log(`Bot ${bot.id} is processing order ${order.id} (${order.type})`);

        setTimeout(() => {
            bot.busy = false;
            this.completed_orders.push(order);
            this.processing_orders = this.processing_orders.filter(order => order.bot.id !== bot.id);
            console.log(`Order ${order.id} completed.`);

            this.updateClients();
            this.processOrders();
        }, 10000);
    }
}

const controller = new OrderController();

app.post('/order/add', (req, res) => {
    let { type } = req.body;
    let { name } = req.body;
    controller.addOrder(type, name);
    res.send({
        message: "Order added",
        pending_orders: controller.pending_orders
    });
});

app.post('/bot/add', (req, res) => {
    controller.addBot();
    res.send({
        message: "Bot added",
        bots: controller.bots
    });
});

app.delete('/bot/delete/:id', (req, res) => {
    let id = req.params.id;
    controller.deleteBot(id);
    res.send({
        message: "Bot removed",
        bots: controller.bots
    });
});

app.get('/bot/get', (req, res) => {
    res.send({
        bots: controller.bots
    });
});

app.get('/order/get', (req, res) => {
    res.send({
        pending_orders: controller.pending_orders,
        completed_orders: controller.completed_orders,
        processing_orders: controller.processing_orders
    });
});

server.listen(3000, () => console.log("Server running on port 3000"));
