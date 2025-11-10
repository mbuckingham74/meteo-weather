import { Button, Grid, Stack } from '@components/ui/primitives';
import TemperatureUnitToggle from '../../units/TemperatureUnitToggle';

function HeroControls({ detectingLocation, handleDetectLocation, locationError }) {
  return (
    <Stack as="div" gap="sm" className="hero-actions-section">
      <Grid
        as="div"
        columns={{ base: 2, md: 4 }}
        gap="sm"
        align="center"
        className="hero-action-buttons"
      >
        <Button
          variant="ghost"
          icon={detectingLocation ? '🔄' : '📍'}
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          aria-label={detectingLocation ? 'Detecting location...' : 'Use my current location'}
          fullWidth
        >
          {detectingLocation ? 'Detecting…' : 'Use My Location'}
        </Button>
        <Button
          as="a"
          href="/compare"
          variant="ghost"
          icon="📊"
          aria-label="Compare locations"
          fullWidth
        >
          Compare
        </Button>
        <Button
          as="a"
          href="/ai-weather"
          variant="ghost"
          icon="🤖"
          aria-label="Ask AI weather assistant"
          fullWidth
        >
          Ask AI
        </Button>
        <div className="hero-temp-toggle">
          <TemperatureUnitToggle />
        </div>
      </Grid>
      {locationError && <div className="hero-location-error">⚠️ {locationError}</div>}
    </Stack>
  );
}

export default HeroControls;
