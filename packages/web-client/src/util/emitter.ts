interface IListener {
	event: string;
	handler: CallableFunction;
}

/**
 * Event emitter class with parameter typing support
 */
class Emitter {
	listeners: IListener[] = [];

	/**
	 * Subscribe to an event
	 *
	 * @param event The event type name that the handler will be subscribed to
	 * @param handler The handler callback function
	 * @param context An optional context object; the default context of the handler callback function will be used if this is not set
	 */
	on<T = unknown>(event: string, handler: (params: T) => void, context?: unknown) {
		if (typeof context === 'undefined') {
			context = handler;
		}

		const newListener: IListener = {
			event: event,
			handler: handler.bind(context)
		};

		this.listeners.push(newListener);
	}

	/**
	 * Unsubscribe from an event
	 *
	 * @param event The event type name that the handler will be unsubscribed from
	 * @param handler The handler callback function
	 */
	off<T = unknown>(event: string, handler: (params: T) => void) {
		this.listeners = this.listeners.filter(
			(listener) => listener.event !== event && listener.handler !== handler
		);
	}

	/**
	 * Emit/publish an event
	 *
	 * @param event The event type name to publish
	 * @param args The arguments to send with the published event
	 */
	emit<T = unknown>(event: string, args: T) {
		this.listeners.forEach((listener: IListener) => {
			if (listener.event === event) {
				listener.handler(args);
			}
		});
	}
}

export default Emitter;
