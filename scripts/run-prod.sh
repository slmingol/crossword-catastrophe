#!/bin/bash
# Production deployment script for Crossword Cat-a-strophe

set -e

CMD="${1:-up}"

case "$CMD" in
  up|start)
    echo "🚀 Starting Crossword Cat-a-strophe (production)..."
    docker compose -f docker-compose.prod.yml up -d
    echo ""
    echo "✅ Services started!"
    echo "   Frontend: http://localhost:9999"
    echo "   Backend:  http://localhost:9998"
    echo ""
    echo "View logs: ./scripts/run-prod.sh logs"
    ;;
    
  down|stop)
    echo "🛑 Stopping services..."
    docker compose -f docker-compose.prod.yml down
    ;;
    
  restart)
    echo "🔄 Restarting services..."
    docker compose -f docker-compose.prod.yml restart
    ;;
    
  logs)
    docker compose -f docker-compose.prod.yml logs -f
    ;;
    
  ps|status)
    docker compose -f docker-compose.prod.yml ps
    ;;
    
  pull)
    echo "📥 Pulling latest images..."
    docker compose -f docker-compose.prod.yml pull
    ;;
    
  update)
    echo "🔄 Updating to latest version..."
    docker compose -f docker-compose.prod.yml pull
    docker compose -f docker-compose.prod.yml up -d
    echo "✅ Updated and restarted!"
    ;;
    
  *)
    echo "Crossword Cat-a-strophe - Production Control"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  up, start   - Start all services (default)"
    echo "  down, stop  - Stop all services"
    echo "  restart     - Restart services"
    echo "  logs        - View logs (follow mode)"
    echo "  ps, status  - Show running services"
    echo "  pull        - Pull latest container images"
    echo "  update      - Pull latest images and restart"
    echo ""
    exit 1
    ;;
esac
