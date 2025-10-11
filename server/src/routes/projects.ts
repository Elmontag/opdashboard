import { Router } from 'express';
import { getProjects, getProjectDetails, updateWorkPackage, upsertOffer, loadAggregate } from '../services/projectService';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const projects = await getProjects();
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = await getProjectDetails(Number(req.params.id));
    if (!project) {
      res.status(404).json({ message: 'Projekt nicht gefunden' });
      return;
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.patch('/:projectId/work-packages/:workPackageId', async (req, res, next) => {
  try {
    const updated = await updateWorkPackage(Number(req.params.projectId), Number(req.params.workPackageId), req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.post('/:projectId/offers', async (req, res, next) => {
  try {
    const offer = await upsertOffer(Number(req.params.projectId), req.body);
    res.json(offer);
  } catch (error) {
    next(error);
  }
});

router.get('/aggregate/summary', async (req, res, next) => {
  try {
    const ids = (req.query.ids as string)?.split(',').map((value) => Number(value.trim())).filter((value) => !Number.isNaN(value)) ?? [];
    const summary = await loadAggregate(ids);
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

export default router;
