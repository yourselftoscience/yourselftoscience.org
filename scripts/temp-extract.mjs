
      import pkg from '../src/data/resources.js';
      const { resources } = pkg;
      console.log(JSON.stringify(resources.map(r => ({
        id: r.id,
        title: r.title,
        lastModified: new Date().toISOString().split('T')[0]
      }))));
    