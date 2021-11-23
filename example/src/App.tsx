import { useState } from 'react';
import './App.css';
import Imgix from 'react-imgix';

import generateSizes from '../../.';

function App() {
  const [count, setCount] = useState(0);

  const headerImageSizes = generateSizes(
    {
      default: '100vw',
    },
    { maxDPR: 2 }
  );

  const cardSizes = generateSizes(
    {
      '(max-width: 900px)': 'calc(100vw - 30px)',
      default: 'calc(50vw - 45px)',
    },
    { maxDPR: 2 }
  );

  return (
    <div>
      <div className="header">
        <Imgix
          sizes={headerImageSizes}
          src="https://assets.imgix.net/examples/espresso.jpg"
          imgixParams={{ ar: '16:9', fit: 'crop', crop: 'faces,edges' }}
        />
      </div>

      <div className="cards">
        <div>
          <Imgix
            sizes={cardSizes}
            src="https://assets.imgix.net/examples/blueberries.jpg"
            imgixParams={{ ar: '16:9', fit: 'crop', crop: 'faces,edges' }}
          />
        </div>

        <div>
          <Imgix
            sizes={cardSizes}
            src="https://assets.imgix.net/examples/vista.png"
            imgixParams={{ ar: '16:9', fit: 'crop', crop: 'faces,edges' }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
